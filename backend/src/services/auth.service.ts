import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { AppError } from '../middlewares/error.middleware'
import { RegisterDTO, LoginDTO } from '../dtos/auth.dto'
import { AuthRepository } from '../repositories/auth.repository'
import { UserRepository } from '../repositories/user.repository'
import { TenantRepository } from '../repositories/tenant.repository'

const authRepository = new AuthRepository()
const userRepository = new UserRepository()
const tenantRepository = new TenantRepository()

export class AuthService {
  async register(data: RegisterDTO) {
    const existingUser = await userRepository.findUnique({ where: { email: data.email } })
    if (existingUser) throw new AppError('Email já cadastrado', 409)

    const existingTenant = await tenantRepository.findUnique({ where: { slug: data.tenantSlug } })
    if (existingTenant) throw new AppError('Slug já em uso', 409)

    const passwordHash = await bcrypt.hash(data.password, 12)

    const tenant = await tenantRepository.create({
      data: {
        name: data.tenantName,
        slug: data.tenantSlug,
        users: {
          create: {
            name: data.name,
            email: data.email,
            password_hash: passwordHash,
            role: 'ADMIN',
          },
        },
      },
      include: { users: true },
    })

    const user = tenant.users[0]
    const { token, refreshToken } = await this.generateTokens(user.id, tenant.id, user.role)

    return {
      token,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
    }
  }

  async login(data: LoginDTO) {
    const user = await userRepository.findUnique({
      where: { email: data.email },
      include: { tenant: true },
    })

    if (!user) throw new AppError('Credenciais inválidas', 401)

    const passwordMatch = await bcrypt.compare(data.password, user.password_hash)
    if (!passwordMatch) throw new AppError('Credenciais inválidas', 401)

    if (!user.tenant.active) throw new AppError('Conta suspensa. Entre em contato com o suporte.', 403)

    const { token, refreshToken } = await this.generateTokens(user.id, user.tenant_id, user.role)

    return {
      token,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tenant: { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug },
    }
  }

  async me(userId: string) {
    const user = await userRepository.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, tenant: { select: { id: true, name: true, slug: true } } },
    })
    if (!user) throw new AppError('Usuário não encontrado', 404)
    return user
  }

  async refresh(refreshToken: string) {
    const existingToken = await authRepository.findRefreshToken(refreshToken)

    if (!existingToken || existingToken.expires_at < new Date()) {
      if (existingToken) {
        await authRepository.deleteRefreshToken(existingToken.id)
      }
      throw new AppError('Refresh token inválido ou expirado', 401)
    }

    // Gerar novo par e excluir o antigo (rotação)
    await authRepository.deleteRefreshToken(existingToken.id)
    return this.generateTokens(existingToken.user.id, existingToken.user.tenant_id, existingToken.user.role)
  }

  private async generateTokens(userId: string, tenantId: string, role: string) {
    const token = jwt.sign({ id: userId, tenantId, role }, process.env.JWT_SECRET!, {
      expiresIn: '15m', // Access token curto
    })

    const refreshPayload = jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '7d' })
    
    await authRepository.createRefreshToken(
      userId,
      refreshPayload,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    )

    return { token, refreshToken: refreshPayload }
  }
}

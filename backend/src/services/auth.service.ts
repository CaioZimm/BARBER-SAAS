import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { AppError } from '../middlewares/error.middleware'
import { RegisterDTO, LoginDTO, RegisterClientDTO } from '../dtos/auth.dto'
import { AuthRepository } from '../repositories/auth.repository'
import { UserRepository } from '../repositories/user.repository'
import { TenantRepository } from '../repositories/tenant.repository'
import prisma from '../config/prisma'

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
        phone: data.tenantPhone,
        address: data.tenantAddress,
        description: data.tenantDescription,
        logo: data.tenantLogo,
        users: {
          create: {
            name: data.name,
            email: data.email,
            phone: data.phone,
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

  async registerClient(data: RegisterClientDTO) {
    const existingUser = await userRepository.findUnique({ where: { email: data.email } })
    if (existingUser) throw new AppError('Email já cadastrado', 409)

    const passwordHash = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password_hash: passwordHash,
        role: 'CLIENT',
        is_active_barber: false,
      }
    })

    const { token, refreshToken } = await this.generateTokens(user.id, undefined, user.role)

    return {
      token,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
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

    if (user.tenant && !user.tenant.active) {
      throw new AppError('Conta suspensa. Entre em contato com o suporte.', 403)
    }

    const { token, refreshToken } = await this.generateTokens(user.id, user.tenant_id ?? undefined, user.role)

    return {
      token,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tenant: user.tenant ? { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug } : undefined,
    }
  }

  async me(userId: string) {
    const user = await userRepository.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, photo: true, bio: true, role: true, tenant: { select: { id: true, name: true, slug: true } } },
    })
    if (!user) throw new AppError('Usuário não encontrado', 404)
    return user
  }

  async updateMe(userId: string, tenantId: string | undefined, data: any) {
    let password_hash = undefined
    if (data.password) {
      password_hash = await bcrypt.hash(data.password, 8)
    }

    const updatedUser = await prisma.user.update({
      where: tenantId ? { id: userId, tenant_id: tenantId } : { id: userId },
      data: {
        name: data.name,
        email: data.email,
        bio: data.bio,
        phone: data.phone,
        photo: data.photo,
        ...(password_hash && { password_hash })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        photo: true,
        bio: true,
        tenant: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    // Sincronizar dados do usuário com os registros locais de Customer nas barbearias
    await prisma.customer.updateMany({
      where: { user_id: userId },
      data: {
        name: data.name,
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
      }
    })

    return updatedUser
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
    return this.generateTokens(existingToken.user.id, existingToken.user.tenant_id ?? undefined, existingToken.user.role)
  }

  private async generateTokens(userId: string, tenantId: string | undefined, role: string) {
    const payload: any = { id: userId, role }
    if (tenantId) payload.tenantId = tenantId

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
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

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../config/prisma'
import { AppError } from '../middlewares/error.middleware'
import { RegisterDTO, LoginDTO } from '../dtos/auth.dto'

export class AuthService {
  async register(data: RegisterDTO) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } })
    if (existingUser) throw new AppError('Email já cadastrado', 409)

    const existingTenant = await prisma.tenant.findUnique({ where: { slug: data.tenantSlug } })
    if (existingTenant) throw new AppError('Slug já em uso', 409)

    const passwordHash = await bcrypt.hash(data.password, 12)

    const tenant = await prisma.tenant.create({
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
    const token = this.generateToken(user.id, tenant.id, user.role)

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
    }
  }

  async login(data: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { tenant: true },
    })

    if (!user) throw new AppError('Credenciais inválidas', 401)

    const passwordMatch = await bcrypt.compare(data.password, user.password_hash)
    if (!passwordMatch) throw new AppError('Credenciais inválidas', 401)

    if (!user.tenant.active) throw new AppError('Conta suspensa. Entre em contato com o suporte.', 403)

    const token = this.generateToken(user.id, user.tenant_id, user.role)

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tenant: { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug },
    }
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, tenant: { select: { id: true, name: true, slug: true } } },
    })
    if (!user) throw new AppError('Usuário não encontrado', 404)
    return user
  }

  private generateToken(userId: string, tenantId: string, role: string) {
    return jwt.sign({ id: userId, tenantId, role }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    })
  }
}

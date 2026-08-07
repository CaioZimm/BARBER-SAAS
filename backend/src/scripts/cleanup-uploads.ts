import fs from 'fs'
import path from 'path'
import prisma from '../config/prisma'
const UPLOADS_DIR = path.join(__dirname, '../../uploads')

async function main() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log('Pasta uploads não encontrada.')
    return
  }

  // Get all files in uploads dir
  const files = fs.readdirSync(UPLOADS_DIR)
  console.log(`Encontrados ${files.length} arquivos na pasta uploads.`)

  // Get all photos from database
  const users = await prisma.user.findMany({ select: { photo: true } })
  const tenants = await prisma.tenant.findMany({ select: { logo: true, photos: true } })
  const services = await prisma.service.findMany({ select: { photos: true } })

  const usedFiles = new Set<string>()

  const extractFilename = (url: string | null) => {
    if (!url) return null
    const parts = url.split('/uploads/')
    if (parts.length > 1) return parts[1]
    return null
  }

  users.forEach(u => {
    const filename = extractFilename(u.photo)
    if (filename) usedFiles.add(filename)
  })

  tenants.forEach(t => {
    const logoFilename = extractFilename(t.logo)
    if (logoFilename) usedFiles.add(logoFilename)
    
    t.photos.forEach(photoUrl => {
      const filename = extractFilename(photoUrl)
      if (filename) usedFiles.add(filename)
    })
  })

  services.forEach(s => {
    s.photos.forEach(photoUrl => {
      const filename = extractFilename(photoUrl)
      if (filename) usedFiles.add(filename)
    })
  })

  let deletedCount = 0

  files.forEach(file => {
    if (!usedFiles.has(file)) {
      try {
        fs.unlinkSync(path.join(UPLOADS_DIR, file))
        console.log(`[LIXO DELETADO] ${file}`)
        deletedCount++
      } catch (err) {
        console.error(`Erro ao deletar ${file}:`, err)
      }
    }
  })

  console.log(`Limpeza concluída! ${deletedCount} arquivos órfãos deletados.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

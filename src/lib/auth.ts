// Liste des emails autorisés à accéder à l'admin
const ADMIN_EMAILS = [
    'admin@fleuris.store',
    // Ajoutez d'autres emails admin ici si nécessaire
]

export function isAdminEmail(email: string | undefined): boolean {
    if (!email) return false
    return ADMIN_EMAILS.includes(email.toLowerCase())
}

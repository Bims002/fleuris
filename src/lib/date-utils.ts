// Utilitaires pour la gestion des dates de livraison

/**
 * Obtenir la date minimum de livraison (demain)
 */
export function getMinDeliveryDate(): string {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
}

/**
 * Vérifier si une date est un dimanche
 */
export function isSunday(date: Date): boolean {
    return date.getDay() === 0
}

/**
 * Vérifier si une date est valide pour la livraison
 * - Pas aujourd'hui
 * - Pas dimanche
 * - Pas dans le passé
 */
export function isValidDeliveryDate(dateString: string): boolean {
    const selectedDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Doit être au moins demain
    if (selectedDate < tomorrow) {
        return false
    }

    // Pas de livraison le dimanche
    if (isSunday(selectedDate)) {
        return false
    }

    return true
}

/**
 * Obtenir la prochaine date de livraison disponible
 */
export function getNextAvailableDeliveryDate(): string {
    let date = new Date()
    date.setDate(date.getDate() + 1) // Commencer à demain

    // Si demain est dimanche, passer à lundi
    while (isSunday(date)) {
        date.setDate(date.getDate() + 1)
    }

    return date.toISOString().split('T')[0]
}

/**
 * Formater une date pour l'affichage
 */
export function formatDeliveryDate(dateString: string): string {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date)
}

/**
 * Formater le créneau horaire
 */
export function formatDeliveryTime(time: 'morning' | 'afternoon'): string {
    return time === 'morning' ? 'Matin (9h-12h)' : 'Après-midi (14h-18h)'
}

/**
 * Obtenir les dates désactivées pour le date picker
 * (tous les dimanches du mois)
 */
export function getDisabledDates(year: number, month: number): string[] {
    const disabledDates: string[] = []
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        if (isSunday(date)) {
            disabledDates.push(date.toISOString().split('T')[0])
        }
    }

    return disabledDates
}

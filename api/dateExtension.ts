export const dateFromString = (input: String) : Date => {
    const [day, month, year] = input.split('/').map(Number);
    
    // Months are 0-indexed in JavaScript Date object
    return new Date(year, month - 1, day);
}
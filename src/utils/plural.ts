// Русское склонение по числу. forms = [одна, две-четыре, пять+]
export function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1]
  return forms[2]
}

// «1 результат» / «2 результата» / «5 результатов»
export function pluralResults(n: number): string {
  return `${n} ${plural(n, ['результат', 'результата', 'результатов'])}`
}

// «1 прикреплённый файл» / «2 прикреплённых файла» / «5 прикреплённых файлов»
export function pluralAttachedFiles(n: number): string {
  const adj = plural(n, ['прикреплённый', 'прикреплённых', 'прикреплённых'])
  const noun = plural(n, ['файл', 'файла', 'файлов'])
  return `${n} ${adj} ${noun}`
}

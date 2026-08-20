export function csvCell(value:unknown){let text=String(value??'');if(/^[=+\-@\t\r]/.test(text))text=`'${text}`;return `"${text.replaceAll('"','""')}"`}
export function reportCsv(rows:Record<string,unknown>[]){if(!rows.length)return '';const keys=Object.keys(rows[0]!);return `${keys.map(csvCell).join(',')}\n${rows.map(r=>keys.map(k=>csvCell(r[k])).join(',')).join('\n')}\n`}

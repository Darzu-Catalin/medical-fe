import { fDate } from "@/utils/format-time";

export function groupFilesByDate(files: any[]): Record<string, any[]> {
    return files.reduce((groups, file) => {
        let date = new Date(file.created_at).toLocaleString();

        // get only DD/MM/YYYY
        date =fDate(date, 'dd/MM/yyyy');

        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(file);
        return groups;
    }, {} as Record<string, any[]>);
}

export function getFileTypeLabel(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('csv')) return 'CSV';
    if (mimeType.includes('text/plain')) return 'TXT';
    return '';
};

'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ReportDownload({ filename, rows }: { filename: string; rows: (string | number)[][] }) {
  function download() {
    const csv = rows.map((row) => row.map((value) => {
      const cell = String(value);
      const safe = /^[\s]*[=+@-]/.test(cell) ? "'" + cell : cell;
      return '"' + safe.replaceAll('"', '""') + '"';
    }).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <Button type="button" variant="outline" onClick={download}>
      <Download className="mr-2 size-4" aria-hidden="true" />
      Descargar CSV
    </Button>
  );
}

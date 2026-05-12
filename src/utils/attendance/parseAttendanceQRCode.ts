function parseAttendanceQRCode(data: string) {
  try {
    const parsedUrl = new URL(data);
    return (parsedUrl.searchParams.get('code') ?? '').replace(/\D/g, '').slice(0, 6);
  } catch {
    return data.replace(/\D/g, '').slice(0, 6);
  }
}

export { parseAttendanceQRCode };

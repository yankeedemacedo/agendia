const cell = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// CSV puro (testável sem banco); separador ; para Excel PT-BR
export const buildAttendeesCsv = (attendees = []) => {
  const header = ["nome", "email", "status", "checkin_em"].map(cell).join(";");
  const lines = attendees.map((a) =>
    [
      a.user?.nome ?? "",
      a.user?.email ?? "",
      a.status ?? "",
      a.checkInAt ? new Date(a.checkInAt).toISOString() : "",
    ]
      .map(cell)
      .join(";"),
  );
  return [header, ...lines].join("\n");
};

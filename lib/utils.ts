export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "اليوم";
  if (diffDays === 1) return "أمس";
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
  if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} أشهر`;
  return `منذ ${Math.floor(diffDays / 365)} سنوات`;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ongoing: "مستمرة",
    completed: "مكتملة",
    hiatus: "متوقفة",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ongoing: "bg-emerald-500",
    completed: "bg-blue-500",
    hiatus: "bg-amber-500",
  };
  return colors[status] || "bg-gray-500";
}

export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    manhwa: "مانهوا",
    manga: "مانجا",
    manhua: "مانها",
  };
  return labels[type] || type;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function Pagination({ currentPage, totalPages, onPageChange, total, limit }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const showAround = 2;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - showAround && i <= currentPage + showAround)
    ) {
      pages.push(i);
    } else if (
      i === currentPage - showAround - 1 ||
      i === currentPage + showAround + 1
    ) {
      pages.push("...");
    }
  }

  const deduped = pages.filter(
    (p, i) => !(p === "..." && pages[i - 1] === "...")
  );

  const start = total && limit ? (currentPage - 1) * limit + 1 : null;
  const end = total && limit ? Math.min(currentPage * limit, total) : null;

  return (
    <div className="flex flex-col items-center gap-3 mt-8">
      {start && end && total && (
        <p className="text-sm" style={{ color: "#718096" }}>
          Showing <strong>{start}–{end}</strong> of <strong>{total}</strong> results
        </p>
      )}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            color: currentPage === 1 ? "#CBD5E0" : "#3B1F6E",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
          }}
        >
          ← Prev
        </button>

        {deduped.map((page, i) =>
          page === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-sm" style={{ color: "#A0AEC0" }}>
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className="w-10 h-10 rounded-xl text-sm font-bold transition"
              style={{
                background:
                  page === currentPage
                    ? "linear-gradient(135deg, #3B1F6E, #5A2D9C)"
                    : "#ffffff",
                color: page === currentPage ? "#ffffff" : "#4A5568",
                border: `1px solid ${page === currentPage ? "#3B1F6E" : "#e2e8f0"}`,
              }}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            color: currentPage === totalPages ? "#CBD5E0" : "#3B1F6E",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
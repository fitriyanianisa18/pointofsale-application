export default function Pagination({ currentPage, totalPages, onPageChange }) {
    const handlePrevPage = () => {
      if (currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    };
  
    const handleNextPage = () => {
      if (currentPage < totalPages) {
        onPageChange(currentPage + 1);
      }
    };
  
    return (
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-[var(--neutral-grey2)] text-[var(--neutral-grey4)] rounded-2xl"
          >
            &lt;
          </button>
  
          {/* Page Numbers */}
          <div className="flex space-x-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => onPageChange(index + 1)}
                className={`px-4 py-2 text-sm rounded-2xl ${
                  currentPage === index + 1
                    ? "bg-[var(--blue1-main)] text-white"
                    : "bg-[var(--neutral-grey2)] text-[var(--neutral-grey4)]"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
  
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-[var(--neutral-grey2)] text-[var(--neutral-grey4)] rounded-2xl"
          >
            &gt;
          </button>
        </div>
      </div>
    );
  }
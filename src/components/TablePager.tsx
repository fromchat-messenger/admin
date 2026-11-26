import Button from "m3-expressive-react/Button";
import page from "@/styles/admin-page.module.scss";

type TablePagerProps = {
  offset: number;
  limit: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
};

export function TablePager({ offset, limit, total, onPrevious, onNext }: TablePagerProps) {
  const pageCount = Math.max(1, Math.ceil(total / limit));
  if (pageCount <= 1) {
    return null;
  }

  const hasPrevious = offset > 0;
  const hasNext = offset + limit < total;

  return (
    <div className={page.pager}>
      {hasPrevious ? (
        <Button variant="text" onClick={onPrevious}>
          Previous
        </Button>
      ) : (
        <span aria-hidden />
      )}
      <span>
        {offset + 1}–{Math.min(offset + limit, total)} of {total}
      </span>
      {hasNext ? (
        <Button variant="text" onClick={onNext}>
          Next
        </Button>
      ) : (
        <span aria-hidden />
      )}
    </div>
  );
}
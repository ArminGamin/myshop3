export default function Loading() {
  return (
    <div className="route-hold" role="status" aria-label="Kraunama">
      <svg className="wreath-draw" viewBox="0 0 64 64" aria-hidden>
        <circle className="wreath-ring" cx="32" cy="32" r="21" />
        <path className="wreath-leaf" d="M32 8c3 6 3 10 0 14-3-4-3-8 0-14z" />
        <path className="wreath-leaf" d="M50 20c-6 2-9 5-11 9 5-1 9-3 11-9z" />
        <path className="wreath-leaf" d="M50 44c-6-2-9-5-11-9 5 1 9 3 11 9z" />
        <path className="wreath-leaf" d="M32 56c-3-6-3-10 0-14 3 4 3 8 0 14z" />
        <path className="wreath-leaf" d="M14 44c6-2 9-5 11-9-5 1-9 3-11 9z" />
        <path className="wreath-leaf" d="M14 20c6 2 9 5 11 9-5-1-9-3-11-9z" />
      </svg>
      <span className="intro-line mt-5" />
    </div>
  );
}

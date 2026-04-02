import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

const Breadcrumbs = ({ crumbs }: { crumbs: Crumb[] }) => {
  return (
    <nav className="flex items-center gap-1 text-[13px] text-[#8A7A65] mb-6">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-[#C5A059]/60">/</span>}
            {isLast || !crumb.href ? (
              <span
                className={
                  isLast
                    ? "font-semibold text-[#2C2C2C]"
                    : "text-[#8A7A65]"
                }
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-[#C5A059] transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;

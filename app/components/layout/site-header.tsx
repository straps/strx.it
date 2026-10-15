import { useEffect, useState } from "react";
import { Link } from "react-router";

import { navItems, site } from "~/lib/site";
import { useScrolled } from "~/lib/use-scrolled";

import { Icon } from "../icons";
import { ButtonLink, Container, cx } from "../ui";

const transition = "duration-200 motion-reduce:transition-none";
const MOBILE_MENU_ID = "mobile-menu";
/** Matches Tailwind's `md` breakpoint, where the inline nav replaces the hamburger. */
const DESKTOP_QUERY = "(min-width: 48rem)";

/** Sticky header that compacts once scrolled; below `md` the nav collapses into a hamburger menu. */
export function SiteHeader() {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useMobileMenu();
  const closeMenu = () => setMenuOpen(false);
  const solid = scrolled || menuOpen;

  return (
    <header
      className={cx(
        "sticky top-0 z-50 border-b border-border transition-[background-color,box-shadow]",
        transition,
        solid ? "bg-bg/90 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md" : "bg-transparent",
      )}
    >
      <Container
        className={cx("flex items-center gap-6 transition-[padding]", transition, scrolled ? "py-2" : "py-4")}
      >
        <Link
          to="/"
          onClick={closeMenu}
          className={cx(
            "mr-auto font-mono font-bold tracking-[-0.02em] text-fg transition-[font-size]",
            transition,
            scrolled ? "text-lg" : "text-xl",
          )}
        >
          strx<span className="text-accent">.it</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="font-mono text-muted hover:text-fg">
              {item.label}
            </a>
          ))}
          <ButtonLink href={`mailto:${site.email}`} size="sm">
            Get in touch
          </ButtonLink>
        </nav>

        <button
          type="button"
          className="-mr-2 inline-flex size-11 items-center justify-center rounded-md text-fg hover:bg-surface-hover md:hidden"
          aria-expanded={menuOpen}
          aria-controls={MOBILE_MENU_ID}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? "close" : "menu"} size={22} />
        </button>
      </Container>

      {menuOpen && (
        <nav
          id={MOBILE_MENU_ID}
          aria-label="Main (mobile)"
          className="absolute inset-x-0 top-full border-b border-border bg-bg shadow-[0_12px_24px_-12px_rgba(0,0,0,0.7)] md:hidden"
        >
          <Container className="flex flex-col py-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="flex min-h-11 items-center border-b border-border/60 font-mono text-base text-muted hover:text-fg"
              >
                {item.label}
              </a>
            ))}
            <ButtonLink href={`mailto:${site.email}`} onClick={closeMenu} className="mt-4 mb-1 justify-center">
              Get in touch
            </ButtonLink>
          </Container>
        </nav>
      )}
    </header>
  );
}

/** Open state of the mobile menu; closes on Escape and when the viewport grows to desktop width. */
function useMobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const close = () => setOpen(false);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    const onResize = () => desktop.matches && close();
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return [open, setOpen] as const;
}

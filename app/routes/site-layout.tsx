import { Outlet } from "react-router";

import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";
import { MusicPlayer } from "~/features/player/music-player";

/** Shared chrome (header + footer) for every public section of the site. */
export default function SiteLayout() {
  return (
    <div className="flex min-h-dvh flex-col pb-20">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <MusicPlayer />
    </div>
  );
}

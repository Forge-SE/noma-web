import * as React from 'react';
import {
  Link as TanStackLink,
  useNavigate,
  useParams,
  useRouter,
  useRouterState,
  type LinkComponentProps,
} from '@tanstack/react-router';

export { useNavigate, useParams };

export function usePathname() {
  return useRouterState({ select: (state) => state.location.pathname });
}

export function useLocation() {
  return useRouterState({ select: (state) => state.location });
}

type AppLinkProps = LinkComponentProps<'a'> & {
  href?: string;
};

export const Link = React.forwardRef<HTMLAnchorElement, AppLinkProps>(
  ({ href, to, ...props }, ref) => (
    <TanStackLink ref={ref} to={to ?? href ?? '/'} {...props} />
  ),
);
Link.displayName = 'Link';

export const NavLink = Link;

export type { AppLinkProps as LinkProps };

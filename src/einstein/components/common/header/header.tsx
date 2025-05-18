import { useNavigate, useLocation } from 'react-router';
import styles from './header.module.scss';
import { useEffect, useRef, useState } from 'react';
import { HeaderNav } from './header.model';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { useSearch } from '@/pages/search/hooks/useSearch';
import { logout } from '@/lib/store/features/auth/authSlice';
import { CitrixNotification } from '@/components/citrix-notification/CitrixNotification';
import { useCitrixNotification } from '@/components/citrix-notification/useCitrixNotification';
import clsx from 'clsx';

export interface IHeaderNav {
  title: string;
  path: string;
}

export function Header() {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const [toggleBurger, setToggleBurger] = useState(false);
  const [toggleSearchBar, setToggleSearchBar] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const { isOpen: isCitrixNotificationOpen, setIsOpen: setIsCitrixNotificationOpen } =
    useCitrixNotification(['/', '/methodologies', '/galileo', '/how-to', '/search/*', '*']);
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  // console.log(user);

  const handleClick = (route: string) => {
    navigate(route);
    setIsAvatarMenuOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery)}`);
      setToggleSearchBar(false);
      setSearchQuery('');
      setIsAvatarMenuOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleAvatarClick = () => {
    setIsAvatarMenuOpen((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
      setIsAvatarMenuOpen(false);
    }
  };

  useEffect(() => {
    if (toggleSearchBar && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [toggleSearchBar]);

  useEffect(() => {
    if (isAvatarMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAvatarMenuOpen]);

  return (
    <>
      <CitrixNotification
        isOpen={isCitrixNotificationOpen}
        onClose={() => setIsCitrixNotificationOpen(false)}
      />
      <header
        className={clsx(styles.header, 'e-margin-centered')}
        style={{ marginTop: isCitrixNotificationOpen ? '32px' : '0px' }}
      >
        <div className={clsx(styles.headerContainer, 'e-margin-centered')}>
          <div className={styles.nav}>
            <div
              className={clsx(styles.logo, 'e-body-2', 'e-600', 'e-crs-pointer')}
              onClick={() => handleClick('/')}
            >
              <img className={clsx(styles.img, 'e-br-100', 'e-pd-6')} src="/logo.svg" alt="" />
              Einstein
            </div>
            <div className={styles.delimiter}></div>
            <nav className={styles.navList}>
              {HeaderNav.map((navItem, index) => {
                // Debugging logs for active state
                const isRoot = navItem.path === '/';
                const isCurrentPathRoot = pathname === '/';
                const isRootMatch = isRoot && isCurrentPathRoot;
                const isSubPathMatch = !isRoot && pathname.startsWith(navItem.path);
                const isActive = isRootMatch || isSubPathMatch;

                // // console.log(
                //   `NavLink Check: Item Path="${navItem.path}", Current Path="${pathname}", isRootMatch=${isRootMatch}, isSubPathMatch=${isSubPathMatch}, isActive=${isActive}`
                // );

                return (
                  <button
                    key={index}
                    onClick={() => handleClick(navItem.path)}
                    className={clsx(styles.navButton, 'e-btn', 'e-btn-sm', 'e-btn-ghost', {
                      [styles.navButtonActive]: isActive,
                    })}
                  >
                    {navItem.title}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className={styles.actions}>
            <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
              <img className={styles.icon} src="/icons/search.svg" alt="" />
              <input
                className={clsx(styles.input, 'e-input')}
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Citrix and Sharepoint"
              />
              <button type="submit" hidden />
            </form>
            <div ref={avatarMenuRef} className={styles.avatarWrapper} onClick={handleAvatarClick}>
              <div className={clsx(styles.avatar, 'e-br-100', 'e-crs-pointer')}>
                <span className={clsx(styles.avatarTitle, 'e-body-5')}>
                  {getInitials(user?.name || '')}
                </span>
              </div>
              {isAvatarMenuOpen && (
                <div className={styles.avatarMenu}>
                  {user?.roles.includes('ADMIN') && (
                    <button className={styles.avatarMenuItem} onClick={() => handleClick('/admin')}>
                      Admin
                    </button>
                  )}
                  <div className={styles.divider} />
                  <button className={styles.avatarMenuItemLogout} onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>

            <div
              className={clsx(styles.burger, 'e-mg-l-16', 'e-crs-pointer')}
              onClick={() => setToggleBurger(!toggleBurger)}
            >
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className={clsx(styles.burgerMenu, {
                    [styles.burgerMenuShow]: toggleBurger,
                  })}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {toggleBurger && (
          <div className={styles.headerMobile}>
            <nav className={styles.mobileNav}>
              {HeaderNav.map((navItem, index) => (
                <button
                  key={index}
                  className={clsx(styles.mobileNavButton, 'e-btn', 'e-btn-md', 'e-btn-ghost-link')}
                  style={{ animationDelay: `${200 + index * 90}ms` }}
                  onClick={() => handleClick(navItem.path)}
                >
                  {navItem.title}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

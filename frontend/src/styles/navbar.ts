import { CSSProperties } from 'react';

export const styles: { [key: string]: CSSProperties } = {
  navbar: {
    position: 'sticky',
    height: '4rem',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTop: '1px solid #e5e7eb',
    padding: '8px 16px',
    zIndex: 50,
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)'
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: '20rem',
    margin: '0 auto'
  },
  link: {
    textDecoration: 'none'
  },
  navLink: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'all 0.2s ease'
  },
  iconWrapper: {
    padding: '8px',
    borderRadius: '8px',
    color: '#6b7280',
    transition: 'all 0.2s ease'
  },
  iconWrapperActive: {
    padding: '8px',
    borderRadius: '8px',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    transition: 'all 0.2s ease'
  },
  iconWrapperHover: {
    color: '#374151'
  },
  label: {
    fontSize: '10pt',
    color: '#6b7280',
    fontWeight: '400',
    transition: 'color 0.2s ease'
  },
  labelActive: {
    fontSize: '10pt',
    color: '#2563eb',
    fontWeight: '500',
    transition: 'color 0.2s ease'
  }
};
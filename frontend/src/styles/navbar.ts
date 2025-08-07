import { CSSProperties } from 'react';
import { Color, Spacing, ComponentSize, FontSizeRem, BorderWidth } from '@/lib/presentation';

export const styles: { [key: string]: CSSProperties } = {
  navbar: {
    position: 'sticky',
    bottom: 0,
    height: '6rem',
    backgroundColor: Color.Surface,
    borderTop: `${BorderWidth.Thin} solid ${Color.Border}`,
    padding: `${Spacing.Medium} ${Spacing.Medium} 0.75rem ${Spacing.Medium}`,
    zIndex: 50,
    boxShadow: '0 -0.125rem 0.5rem rgba(0, 0, 0, 0.1)',
    flexShrink: 0
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: '20rem',
    margin: '0 auto'
  },
  link: {
    textDecoration: 'none',
    cursor: 'pointer'
  },
  navLink: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.XSmall,
    textDecoration: 'none',
    borderRadius: Spacing.Small,
    transition: 'all 0.2s ease'
  },
  iconWrapper: {
    padding: Spacing.MediumSmall,
    borderRadius: Spacing.Small,
    color: Color.Muted,
    transition: 'all 0.2s ease',
    width: ComponentSize.IconContainer,
    height: ComponentSize.IconContainer,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconWrapperActive: {
    padding: Spacing.MediumSmall,
    borderRadius: Spacing.Small,
    color: Color.Primary,
    backgroundColor: '#eff6ff',
    transition: 'all 0.2s ease',
    width: ComponentSize.IconContainer,
    height: ComponentSize.IconContainer,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconWrapperHover: {
    color: Color.Text
  },
  label: {
    fontSize: FontSizeRem.NavLabel,
    color: Color.Muted,
    fontWeight: '400',
    transition: 'color 0.2s ease',
    lineHeight: '1.1',
    textAlign: 'center'
  },
  labelActive: {
    fontSize: FontSizeRem.NavLabel,
    color: Color.Primary,
    fontWeight: '500',
    transition: 'color 0.2s ease',
    lineHeight: '1.1',
    textAlign: 'center'
  }
};
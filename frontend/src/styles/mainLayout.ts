import { CSSProperties } from 'react';
import { Color, FontFamily } from '@/lib/presentation';

export const styles: { [key: string]: CSSProperties } = {
  container: {
    height: '100vh',
    backgroundColor: Color.Background,
    fontFamily: FontFamily.VarelaRound,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '0.5rem'
  }
};
import { CSSProperties } from 'react';
import { Color, Spacing, ComponentSize, FontSizeRem, BorderWidth, Radius, FontFamily } from '@/lib/presentation';

export const styles: { [key: string]: CSSProperties } = {
  container: {
    width: '100%',
    minWidth: '95vw',
    backgroundColor: Color.Surface,
    minHeight: '100vh',
    fontFamily: FontFamily.VarelaRound,
    color: Color.Text,
    colorScheme: 'light',
    margin: Spacing.Medium
  },
  header: {
    borderBottom: `${BorderWidth.Thin} solid ${Color.Border}`,
    backgroundColor: Color.Surface,
    position: 'sticky',
    top: 0,
    zIndex: 10,
    color: Color.Text
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.Medium
  },
  headerTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    margin: 0,
    color: Color.Text
  },
  iconButton: {
    padding: Spacing.Small,
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: Spacing.XSmall,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: Color.Text,
  },
  profileSection: {
    padding: Spacing.Medium,
    backgroundColor: Color.Surface,
    color: Color.Text
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1rem'
  },
  avatar: {
    width: ComponentSize.AvatarSize,
    height: ComponentSize.AvatarSize,
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0
  },
  profileInfo: {
    flex: 1,
    minWidth: 0
  },
  profileTopRow: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '0.5rem'
  },
  username: {
    fontSize: '1.25rem',
    fontWeight: '300',
    margin: '0 0 0.5rem 0',
    color: 'black'
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem'
  },
  messageButton: {
    padding: `${Spacing.XSmall} ${Spacing.Medium}`,
    backgroundColor: Color.Surface,
    border: `${BorderWidth.Thin} solid ${Color.Border}`,
    borderRadius: Spacing.XSmall,
    fontWeight: '500',
    cursor: 'pointer',
    color: Color.Text
  },
  stats: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '1rem',
    fontSize: '0.875rem'
  },
  statButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    padding: 0,
    color: 'black'
  },
  bioSection: {
    marginBottom: '1rem'
  },
  bioName: {
    fontWeight: '600',
    margin: '0 0 0.25rem 0',
    color: 'black'
  },
  bioText: {
    fontSize: '0.875rem',
    whiteSpace: 'pre-line',
    margin: 0,
    lineHeight: '1.4',
    color: 'black'
  },
  bioEditContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    marginTop: '0.5rem'
  },
  bioTextarea: {
    flex: 1,
    padding: '0.5rem',
    border: `${BorderWidth.Thin} solid ${Color.Border}`,
    borderRadius: Spacing.XSmall,
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: ComponentSize.ProfileInputMinHeight,
    backgroundColor: 'white',
    color: 'black'
  },
  editButton: {
    padding: '0.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: Spacing.XSmall,
    cursor: 'pointer',
    color: '#6b7280'
  },
  saveButton: {
    padding: '0.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: Spacing.XSmall,
    cursor: 'pointer',
    color: '#10b981'
  },
  cancelButton: {
    padding: '0.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: Spacing.XSmall,
    cursor: 'pointer',
    color: '#ef4444'
  },
  postsGrid: {
    display: 'grid',
    width: '95vw',
    marginLeft: 'auto',
    marginRight: 'auto',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.0625rem',
    padding: '0.0625rem'
  },
  postItem: {
    position: 'relative',
    aspectRatio: '1',
    cursor: 'pointer'
  },
  postImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  postOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s'
  },
  overlayStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    color: 'white'
  },
  overlayStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(0.25rem)'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: Spacing.Small,
    width: '100%',
    maxWidth: '24rem',
    margin: '1rem',
    maxHeight: '24rem',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: `${BorderWidth.Thin} solid ${Color.Border}`
  },
  modalTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    margin: 0,
    color: 'black'
  },
  modalBody: {
    overflowY: 'auto',
    maxHeight: '20rem'
  },
  userListItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  userAvatar: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  userUsername: {
    fontWeight: '600',
    fontSize: '0.875rem',
    margin: 0,
    color: 'black'
  },
  domain: {
    fontWeight: '300',
    fontSize: '0.8rem',
    margin: 0,
    fontStyle: 'italic',
    color: 'grey'
  },
  userDisplayName: {
    color: '#6b7280',
    fontSize: '0.75rem',
    margin: 0
  },
  settingsContent: {
    padding: '1rem',
    backgroundColor: 'white',
    color: 'black'
  },
  settingItem: {
    marginBottom: '1rem'
  },
  settingLabel: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  settingInput: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    border: `${BorderWidth.Thin} solid ${Color.Border}`,
    borderRadius: Spacing.XSmall,
    fontSize: '0.875rem',
    backgroundColor: 'white',
    color: 'black'
  },
  settingInputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  settingText: {
    color: 'black'
  },
  settingsMenu: {
    borderTop: `${BorderWidth.Thin} solid ${Color.Border}`,
    paddingTop: '1rem'
  },
  settingMenuButton: {
    width: '100%',
    textAlign: 'left',
    padding: '0.5rem 0.75rem',
    borderRadius: Spacing.XSmall,
    border: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
    color: 'black'
  },
  settingMenuButtonDanger: {
    color: '#ef4444'
  },
  emptyState: {
    gridColumn: '1 / -1',
    padding: '5rem 0',
    textAlign: 'center',
    color: '#6b7280'
  }
};
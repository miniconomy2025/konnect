import { CSSProperties } from 'react';

export const styles: { [key: string]: CSSProperties } = {
  container: {
    width: '100%',
    backgroundColor: 'white',
    minHeight: '100vh',
    maxWidth: '960px',
    marginLeft: 'auto',
    marginRight: 'auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: 'black',
    colorScheme: 'light'
  },
  header: {
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    color: 'black'
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem'
  },
  headerTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    margin: 0,
    color: 'black'
  },
  iconButton: {
    padding: '0.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'black',
  },
  profileSection: {
    padding: '1rem',
    backgroundColor: 'white',
    color: 'black'
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1rem'
  },
  avatar: {
    width: '80px',
    height: '80px',
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
    padding: '0.25rem 1rem',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontWeight: '500',
    cursor: 'pointer',
    color: 'black'
  },
  stats: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '0.75rem',
    fontSize: '0.9rem',
    flexWrap: 'wrap'
  },
  statButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '0.25rem 0.5rem',
    borderRadius: 8,
    color: 'black'
  },
  bioSection: {
    marginBottom: '0.75rem'
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
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '60px',
    backgroundColor: 'white',
    color: 'black'
  },
  editButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#374151',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 150ms ease',
  },
  saveButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #10b981',
    backgroundColor: '#10b981',
    borderRadius: '6px',
    cursor: 'pointer',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 150ms ease',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #ef4444',
    backgroundColor: '#fee2e2',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#dc2626',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 150ms ease',
  },
  postsGrid: {
    display: 'grid',
    width: '100%',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '4px',
    padding: '4px'
  },
  postItem: {
    position: 'relative',
    aspectRatio: '1',
    cursor: 'pointer',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f9fb',
    border: '1px solid #eee'
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
    background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.25))',
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
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: 'min(95vw, 720px)',
    margin: '1rem',
    maxHeight: '80vh',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb'
  },
  modalTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    margin: 0,
    color: 'black'
  },
  modalBody: {
    overflowY: 'auto',
    maxHeight: 'calc(80vh - 56px)',
    padding: '1rem'
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
    border: '1px solid #d1d5db',
    borderRadius: '4px',
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
    borderTop: '1px solid #e5e7eb',
    paddingTop: '1rem'
  },
  settingMenuButton: {
    width: '100%',
    textAlign: 'left',
    padding: '0.5rem 0.75rem',
    borderRadius: '4px',
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
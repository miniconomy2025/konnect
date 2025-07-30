const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    maxWidth: '935px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginRight: '20px',
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
  },
  profile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  profilePicture: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '10px',
  },
  bioText: {
    fontSize: '14px',
    color: '#333',
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '20px',
  },
  statItem: {
    textAlign: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: '16px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#777',
  },
  tabs: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '20px',
    borderTop: '1px solid #dbdbdb',
    borderBottom: '1px solid #dbdbdb',
  },
  tab: {
    padding: '10px 0',
    cursor: 'pointer',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tabActive: {
    borderBottom: '2px solid #000',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '10px',
  },
  postImage: {
    width: '100%',
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  modalContent: {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '400px',
  },
  userListItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #eee',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '10px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  username: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  fullName: {
    fontSize: '12px',
    color: '#666',
  },
  settingsOption: {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
    textAlign: 'center',
  },
};

export default styles;
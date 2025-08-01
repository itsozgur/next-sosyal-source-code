import ImmutablePropTypes from 'react-immutable-proptypes';

export default function Badges({ account }) {
  if (!account || !account.get('badges')) {
    return null;
  }

  const badges = account.get('badges').toJS();

  badges.sort((a, b) => a.order - b.order);
  
  return (
    <div className="account__badges">
      {badges.map((badge, index) => (
         <div key={index} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <span>{badge.name}</span>
          <img
            src={badge.icon}
            alt={badge.name}
            style={{
              width: '20px',
              height: '20px',
              objectFit: 'contain'
            }}
          />
        </div>
      ))}
    </div>
  );
}

Badges.propTypes = {
  account: ImmutablePropTypes.record,
};

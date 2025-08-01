import { Link } from 'react-router-dom';

import { useAppSelector } from 'mastodon/store';
import Badges from 'mastodon/features/account/components/badges';

export const DisplayedName: React.FC<{
  accountIds: string[];
}> = ({ accountIds }) => {
  const lastAccountId = accountIds[0] ?? '0';
  const account = useAppSelector((state) => state.accounts.get(lastAccountId));

  if (!account) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Link
        to={`/@${account.acct}`}
        title={`@${account.acct}`}
        data-hover-card-account={account.id}
      >
        <bdi dangerouslySetInnerHTML={{ __html: account.display_name_html }} />
      </Link>
      {account.get('badges')?.toJS()
        .filter(badge => badge.rank === 1)
        .map((badge, index) => (
          <div key={index} style={{
            background: 'rgba(var(--accent-color-rgb), 0.1)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <img
              src={badge.icon}
              alt={badge.name}
              title={badge.name}
              style={{
                width: '17px',
                height: '17px',
                objectFit: 'contain'
              }}
            />
          </div>
        ))}
    </div>
  );
};

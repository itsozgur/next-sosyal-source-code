# Next Sosyal

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

> [🇹🇷 Türkçe Dokümantasyon](./README.tr.md) | [🇬🇧 English Documentation](./README.md)

Next Sosyal is a social network platform built on Mastodon's reliable and open-source infrastructure, focusing on Türkiye's technology future. This project is a fork of [Mastodon](https://github.com/mastodon/mastodon) with Turkish localization and custom features to encourage young people to engage with technology through community power and support the local technology ecosystem.

## 📖 Table of Contents

- [About the Project](#about-the-project)
- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Docker Commands](#docker-commands)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Contact & Community](#contact--community)
- [Acknowledgments](#acknowledgments)

## 🌟 About the Project

Next Sosyal is a social network platform forked from [Mastodon](https://github.com/mastodon/mastodon), adapted for Türkiye's technology community. This project builds upon Mastodon's reliable and open-source infrastructure while adding features and improvements focused on the Turkish technology ecosystem.

### Key Differences from Mastodon

- **Turkish Localization**: Enhanced Turkish language support and cultural adaptations
- **Community Focus**: Features designed specifically for Türkiye's tech community
- **Custom Branding**: Tailored visual identity and user experience
- **Local Features**: Türkiye-specific functionality and integrations

### Core Objectives

- **Open Source**: Transparent and community-supported development
- **Secure**: Protection of user data and privacy following Mastodon's security standards
- **Community-First Structure**: Creating a healthy social environment where users can express themselves freely, protected by community principles against hate speech and malicious manipulation
- **Cultural Adaptation**: Providing a platform that resonates with Turkish technology enthusiasts

**Technologies Used:**

- [Ruby on Rails](https://rubyonrails.org/) - Web application framework
- [React.js](https://reactjs.org/) & [Redux](https://redux.js.org/) - Frontend framework and state management
- [Node.js](https://nodejs.org/) - JavaScript runtime for streaming API
- [PostgreSQL](https://www.postgresql.org/) - Primary database
- [Redis](https://redis.io/) - Caching and session storage
- [Docker](https://www.docker.com/) - Containerization
- [Mastodon API](https://docs.joinmastodon.org/api/) - Social networking backend

## 🚀 Getting Started

Follow the steps below to set up and run the project on your local machine.

### Requirements

What you need to have installed on your system to run the project:

- **Docker** and **Docker Compose**
- **Git**
- **Ruby** 3.2+
- **Node.js** 18+
- **PostgreSQL** 12+
- **Redis** 4+

### Installation

1. Start the development environment:

   ```bash
   docker compose -f .devcontainer/compose.yaml up -d
   docker compose -f .devcontainer/compose.yaml exec app bin/setup
   docker compose -f .devcontainer/compose.yaml exec app bin/dev
   ```

2. Visit the application:
   - Open your browser and go to `http://localhost:3000`

## 🎯 Usage

### Local Development

Run the commands below to run the project:

```bash
docker compose -f .devcontainer/compose.yaml up -d
docker compose -f .devcontainer/compose.yaml exec app bin/setup
docker compose -f .devcontainer/compose.yaml exec app bin/dev
```

### Contributing Setup

Run the command below before commit to disable system checks:

```bash
npx husky disable
```

## ✨ Features

**No vendor lock-in: Fully interoperable with any conforming platform** - It doesn't have to be Mastodon; whatever implements ActivityPub is part of the social network! [Learn more](https://blog.joinmastodon.org/2018/06/why-activitypub-is-the-future/)

**Real-time, chronological timeline updates** - updates of people you're following appear in real-time in the UI via WebSockets. There's a firehose view as well!

**Media attachments like images and short videos** - upload and view images and WebM/MP4 videos attached to the updates. Videos with no audio track are treated like GIFs; normal videos loop continuously!

**Safety and moderation tools** - Mastodon includes private posts, locked accounts, phrase filtering, muting, blocking, and all sorts of other features, along with a reporting and moderation system. [Learn more](https://blog.joinmastodon.org/2018/07/cage-the-mastodon/)

**OAuth2 and a straightforward REST API** - Mastodon acts as an OAuth2 provider, so 3rd party apps can use the REST and Streaming APIs. This results in a rich app ecosystem with a lot of choices!

## 🛠️ Tech Stack

- **Ruby on Rails** - Powers the REST API and other web pages
- **React.js** and **Redux** - Used for the dynamic parts of the interface
- **Node.js** - Powers the streaming API
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **Docker** - Containerization and development environment

## 🔧 Environment Variables

The application requires certain environment variables to be defined for proper operation. These variables should be configured separately for `development`, `staging`, and `production` environments.

### Required Variables

| Variable Name                         | Description                                         |
| ------------------------------------- | --------------------------------------------------- |
| `LOCAL_DOMAIN`                        | Your server's domain name (cannot be changed later) |
| `SECRET_KEY_BASE`                     | Rails application secret key                        |
| `OTP_SECRET`                          | One-time password secret                            |
| `VAPID_PRIVATE_KEY`                   | Web push notification private key                   |
| `VAPID_PUBLIC_KEY`                    | Web push notification public key                    |
| `DB_HOST`                             | PostgreSQL database host                            |
| `DB_USER`                             | PostgreSQL database user                            |
| `DB_NAME`                             | PostgreSQL database name                            |
| `DB_PASS`                             | PostgreSQL database password                        |
| `REDIS_HOST`                          | Redis server host                                   |
| `REACT_APP_SITE_NAME`                 | Application name displayed in UI                    |
| `REACT_APP_LIGHT_LOGO_URL`            | URL for light theme logo                            |
| `REACT_APP_DARK_LOGO_URL`             | URL for dark theme logo                             |
| `REACT_APP_SIGNUP_URL`                | URL for user registration page                      |
| `AUTH_URL`                            | Authentication service URL                          |
| `ASSET_HOST`                          | Static assets host URL                              |
| `REACT_APP_FAVICON_URL`               | Favicon URL                                         |
| `INTERNAL_API_SECRET_TOKEN`           | Internal API authentication token                   |
| `DISALLOW_UNAUTHENTICATED_API_ACCESS` | Restrict API access to authenticated users          |
| `CDN_URL`                             | Content delivery network URL                        |
| `ALLOW_ACCESS_TO_INSTANCE_PEERS`      | Allow access to instance peer information           |
| `PUBLISH_PEERS`                       | Publish peer information                            |
| `DISABLE_FEDERATION`                  | Disable ActivityPub federation                      |
| `LIMITED_FEDERATION_MODE`             | Enable limited federation mode                      |
| `PEERS_API_ENABLED`                   | Enable peers API endpoint                           |
| `ALLOWED_DOMAINS`                     | List of allowed domains for federation              |
| `AUTH_CDN_URL`                        | Authentication CDN URL                              |
| `PUBLIC_TIMELINE_ACCESS`              | Control public timeline access                      |

## 🐳 Docker Commands

### Starting/Stopping Services

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f
```

### Maintenance Commands

```bash
# Database migration
docker compose run --rm web rails db:migrate

# Asset compilation
docker compose run --rm web rails assets:precompile

# Clear cache
docker compose run --rm web rails tmp:clear

# Check system status
docker compose run --rm web rails mastodon:check
```

### Admin User Management

#### Connect to Docker Container

```bash
docker exec -it devcontainer-app-1 bash
```

#### Access Rails Console

```bash
rails console
```

#### Create New Admin User

```ruby
# Find admin role
admin_role = UserRole.find_by(name: 'Admin')

# Create new admin user
user = User.create!(
  email: 'admin@example.com',
  password: 'password123',
  confirmed_at: Time.now.utc,
  agreement: true,
  approved: true,
  role: admin_role,
  account_attributes: {
    username: 'admin',
    display_name: 'Site Administrator'
  }
)
```

#### Change Password (if needed)

```ruby
user = User.find_by(email: 'admin@example.com')
user.reset_password!('NewPassword123', 'NewPassword123')
```

#### Grant Admin Rights to Existing User

```ruby
# Find user by email
user = User.find_by(email: 'user@example.com')
# OR find by username
user = User.joins(:account).find_by(accounts: { username: 'username' })

# Make admin
admin_role = UserRole.find_by(name: 'Admin')
user.update!(
  approved: true,
  role: admin_role,
  confirmed_at: Time.now.utc
)
```

## 💻 Development

### Branching Strategy

Branches should be organized into folders. The folder names listed below are not mandatory:

- **feature/** → New Features
- **bugfix/** → Bug Fixes
- **wip/** → Work in Progress
- **release/** → Preparing for Release
- **optimization/** → Performance Enhancements
- **refactor/** → Code Refactoring
- **chore/** → Routine Maintenance Tasks
- **docs/** → Documentation Updates
- **test/** → Testing and Experimentation

### Commit Message Convention

- Separate the subject from the body with a blank line.
- Limit the **subject** line to **50** characters.
- Do not end the subject line with a period.
- Use the **imperative** mood in the subject line.
- Wrap the body at 72 characters.
- Use the body to explain what and why, not how.

#### Example

```
Refactor auth service to support multi-factor authentication

Multi-factor authentication (MFA) added to the auth service

- Create new endpoint to verify OTP.
- Enhance checks for both JWT token and OTP validation.
- Update README.md to reflect new authentication flow.
- Add unit and integration tests for MFA scenarios.

Improves security by requiring an additional verification factor.
```

#### Further Reading

- [How to Write a Git Commit Message](https://cbea.ms/git-commit/)
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)

## 🤝 Contributing

Next Sosyal is **free, open-source software** licensed under **AGPL-3.0**, maintaining compatibility with the original Mastodon license.

Your contributions will make this project better! If you want to contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

You can open issues for bugs you've found or features you think are missing. You can also submit pull requests to this repository.

We expect all members of our community to follow responsible disclosure practices and our community guidelines.

### Upstream Contributions

If your contribution is a general improvement that would benefit all Mastodon users, consider contributing to the upstream [Mastodon project](https://github.com/mastodon/mastodon) as well.

## 📜 License

This project is licensed under the [AGPL-3.0 License](LICENSE), maintaining compatibility with the upstream Mastodon project.

```
Copyright (C) 2016-2024 Eugen Rochko & other Mastodon contributors (see AUTHORS.md)
Copyright (C) 2024 Next Sosyal contributors

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License as published by the Free
Software Foundation, either version 3 of the License, or (at your option) any
later version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
details.

You should have received a copy of the GNU Affero General Public License along
with this program. If not, see https://www.gnu.org/licenses/
```

## 💬 Contact & Community

Have questions or ideas? Get in touch with us!

- **Email:** [Contact us](mailto:apps@2ntech.com.tr)

## 🙏 Acknowledgments

- **Primary Attribution**: This project is a fork of [Mastodon](https://github.com/mastodon/mastodon) by Eugen Rochko and the Mastodon team
- To the entire Mastodon community for creating the foundation this project builds upon
- To all contributors who help improve this Turkish-focused fork
- To the open source community and free software movement
- To everyone who believes in Türkiye's technology future and decentralized social networks

### Upstream Credits

This project would not exist without the incredible work of:

- **The Mastodon team** - Core maintainers and contributors
- **The ActivityPub community** - For the decentralized social web standard

---

**Next Sosyal** - Contribute to Türkiye's technology future! 🚀

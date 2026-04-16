# RandyBeats - Premium Beat Store

A full-stack React + Firebase + PayPal beat store application with admin management and user authentication.

## Features

### Public Store
- **Landing Page** with hero section, search, and genre filtering
- **Beat Grid** displaying cover art, title, genre, BPM, key, price, and 30-second preview
- **Responsive Design** optimized for mobile, tablet, and desktop
- **Dark Theme** with orange accents

### User Features
- **Authentication** via Firebase (email/password signup and login)
- **Dashboard** to view purchased beats library
- **Download Access** to purchased beats
- **Purchase History** tracking

### Admin Features
- **Beat Management** - Add, edit, and delete beats
- **Image Upload** - Upload cover art via ImgBB
- **Beat Metadata** - Manage title, genre, BPM, price, key, tags, description, audio URL
- **Export JSON** - Export all beats as JSON
- **Admin-Only Access** - Role-based access control

### Payment
- **PayPal Integration** - Secure checkout with PayPal buttons
- **Purchase Recording** - Automatic purchase tracking in Firestore

## Tech Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS 4
- **Backend:** Express.js (for PayPal endpoints)
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Image Hosting:** ImgBB
- **Payment:** PayPal
- **Deployment:** Manus Hosting

## Setup Instructions

### Prerequisites

- Node.js 18+ and pnpm
- Firebase project with Firestore enabled
- PayPal Business account
- ImgBB API key

### Environment Variables

Create a `.env.local` file in the `client` directory:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_IMGBB_API_KEY=your_imgbb_api_key
```

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
client/
  src/
    pages/          # Page components (Home, Login, Register, Dashboard, Admin, Checkout)
    components/     # Reusable components (Navigation, BeatCard, ImageUpload, etc.)
    contexts/       # React contexts (AuthContext)
    lib/            # Service functions (Firebase, PayPal, ImgBB)
    App.tsx         # Main app with routing
    index.css       # Global styles with dark theme

server/
  _core/            # Core framework files
  routers.ts        # tRPC routers (if using backend)

drizzle/
  schema.ts         # Database schema (if using MySQL backend)
```

## Key Features Implementation

### Authentication Flow
1. User signs up/logs in via Firebase
2. Auth state managed in `AuthContext`
3. Protected routes redirect unauthenticated users to login
4. Admin routes check for admin role

### Beat Purchase Flow
1. User browses beats on landing page
2. Clicks "Buy" on a beat
3. Redirected to login if not authenticated
4. PayPal checkout page displays beat details
5. User completes PayPal payment
6. Purchase recorded in Firestore
7. Beat added to user's dashboard library

### Admin Beat Management
1. Admin logs in and navigates to `/admin`
2. Can add new beats with metadata and cover art upload
3. Can edit existing beats
4. Can delete beats with confirmation
5. Can export all beats as JSON
6. Beat list shows all beats in table format

## API Endpoints (To Be Implemented)

- `POST /api/paypal/create-order` - Create PayPal order
- `POST /api/paypal/approve-order` - Approve PayPal order

## Firestore Collections

### `beats`
```typescript
{
  id: string;
  title: string;
  genre: string;
  bpm: number;
  price: number;
  audioUrl: string;
  coverArt: string;
  description: string;
  key: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `purchases`
```typescript
{
  id: string;
  userId: string;
  beatId: string;
  beatTitle: string;
  beatPrice: number;
  paypalOrderId: string;
  purchasedAt: Timestamp;
}
```

### `users`
```typescript
{
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  createdAt: Timestamp;
}
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for beats
    match /beats/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid != null && request.auth.token.admin == true;
    }

    // Users can read/write their own purchases
    match /purchases/{document=**} {
      allow read: if request.auth.uid == resource.data.userId;
      allow write: if request.auth.uid == request.resource.data.userId;
    }

    // Users can read their own profile
    match /users/{uid} {
      allow read: if request.auth.uid == uid;
      allow write: if request.auth.uid == uid;
    }
  }
}
```

## Testing Checklist

- [ ] Browse beats on landing page
- [ ] Search beats by title/description
- [ ] Filter beats by genre
- [ ] Play 30-second beat preview
- [ ] Sign up new account
- [ ] Log in with existing account
- [ ] View dashboard with purchased beats
- [ ] Download purchased beat
- [ ] Complete PayPal checkout
- [ ] Add new beat as admin
- [ ] Edit beat as admin
- [ ] Delete beat as admin
- [ ] Export beats as JSON
- [ ] Test responsive design on mobile/tablet
- [ ] Test dark theme

## Deployment

The application is ready for deployment on Manus Hosting. Use the Management UI to:

1. Configure custom domain
2. Set environment variables
3. Deploy from GitHub
4. Monitor analytics

## Support

For issues or questions, please refer to the documentation or contact support.

## License

MIT

# 🎉 Lucky Draw Flow Documentation

## Overview

The Lucky Draw flow has been completely redesigned to provide a simple, streamlined user experience for contest registration via WhatsApp.

## ✅ Changes Made

### Removed
- ❌ Hospital-related flows and triggers
- ❌ Complex message library system
- ❌ Old trigger service dependencies
- ❌ Flow messages and interactive buttons

### Added
- ✅ Simple "Join" command to start registration
- ✅ Two-step registration process (Join → Name)
- ✅ Automatic participant storage in database
- ✅ Success confirmation with draw date
- ✅ Company brochure sending (PDF)

---

## 🔄 User Flow

### Step 1: User Initiates
**User Action**: Sends "Join" message or clicks "Join" button

**Bot Response**:
```
Welcome to 3rd Eye Security Systems. Please enter your name to join contest.
```

### Step 2: User Provides Name
**User Action**: Sends their name (e.g., "John Doe")

**Bot Response**:
```
You've successfully entered the Lucky Draw! 🎉
The draw will take place on Monday, 10th November 2025.
We'll notify you if you're one of the winners.
Good luck! 🍀
```

### Step 3: Brochure Sent
**Bot Action**: Automatically sends company brochure PDF

**File**: `3rd-eye-security-brochure.pdf` from `public/` folder

---

## 📊 Data Storage

### Database Table: `participants`

Participant data is stored with the following fields:

```sql
{
  id: UUID (auto-generated),
  contest_id: UUID (references contests table),
  name: TEXT (user's name),
  phone_number: TEXT (WhatsApp number),
  entry_timestamp: TIMESTAMP (registration time)
}
```

### Visibility

The participant data is visible in:
1. **Contest Page** - Shows all participants for each contest
2. **Participants Page** - Lists all participants across contests
3. **Draw Page** - Used for selecting winners

---

## 🗂️ File Structure

### New Files Created

1. **`services/luckyDrawService.js`**
   - Handles Lucky Draw flow logic
   - Manages user states (awaiting name, etc.)
   - Saves participants to database
   - Sends confirmation messages

2. **`services/webhookService.js`** (replaced)
   - Simplified webhook handler
   - Routes messages to Lucky Draw flow
   - Handles test webhooks

3. **`public/README.md`**
   - Instructions for adding brochure PDF

### Backup Files

- **`services/webhookService_old.js`** - Original hospital flow (backed up)

---

## 🧪 Testing

### Test via API

#### 1. Test "Join" Message
```bash
curl -X POST http://localhost:3001/api/webhook/test-text \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Join",
    "phoneNumber": "+1234567890"
  }'
```

**Expected Response**:
- Bot sends welcome message
- User state set to "awaiting_name"

#### 2. Test Name Submission
```bash
curl -X POST http://localhost:3001/api/webhook/test-text \
  -H "Content-Type: application/json" \
  -d '{
    "message": "John Doe",
    "phoneNumber": "+1234567890"
  }'
```

**Expected Response**:
- Participant saved to database
- Success message sent
- Brochure sent (if PDF exists)

### Test via WhatsApp

1. Send "Join" to your WhatsApp Business number
2. Wait for welcome message
3. Reply with your name
4. Receive confirmation and brochure

---

## 📄 Brochure Setup

### Requirements

- **File Format**: PDF
- **File Name**: `3rd-eye-security-brochure.pdf`
- **Location**: `public/` folder
- **Max Size**: 16MB (WhatsApp limit)

### How to Add

1. Place your PDF in `e:\Nano\luckydrawwhatsappbackend\public\`
2. Rename to `3rd-eye-security-brochure.pdf`
3. Restart the server
4. Brochure will be sent automatically after registration

### If Brochure Missing

- Registration still works
- Warning logged in console
- No brochure sent (graceful degradation)

---

## 🔧 Configuration

### Environment Variables

Required in `.env`:

```env
# Supabase (for database)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_NUMBER=+15550617327

# Server
PORT=3001
NODE_ENV=development
```

### Contest Setup

The flow automatically uses the most recent contest. To create a contest:

1. Go to Contest Page in your frontend
2. Create a new contest
3. Participants will be added to this contest

---

## 🎯 User States

The flow uses in-memory state management:

| State | Description | Next Action |
|-------|-------------|-------------|
| `null` | No active flow | User can send "Join" |
| `awaiting_name` | Waiting for name | User provides name |

States are automatically cleared after:
- Successful registration
- Error occurs
- Server restart

---

## 📱 Message Triggers

### Supported Commands

| Command | Case Sensitive | Action |
|---------|----------------|--------|
| `join` | No | Start registration |
| `Join` | No | Start registration |
| `JOIN` | No | Start registration |

### Button IDs

If using interactive buttons:
- `join_contest` - Starts registration flow

---

## 🔍 Debugging

### Check User State

```javascript
const { getUserState } = require('./services/luckyDrawService');
const state = getUserState('+1234567890');
console.log('User state:', state);
```

### Reset User State

```javascript
const { resetUserState } = require('./services/luckyDrawService');
resetUserState('+1234567890');
```

### View Logs

```bash
# Start server with logs
npm run dev

# Watch for:
# 🎯 Starting Lucky Draw flow
# ✅ Participant saved to database
# ✅ Sent success message
# 📄 Sending brochure
```

---

## 🐛 Troubleshooting

### Issue: "Join" not working

**Check**:
1. Server is running (`npm run dev`)
2. Webhook is configured correctly
3. Message is exactly "Join" (case insensitive)

**Solution**: Check server logs for errors

### Issue: Name not being saved

**Check**:
1. Supabase credentials in `.env`
2. Contest exists in database
3. User state is `awaiting_name`

**Solution**: Check database connection and logs

### Issue: Brochure not sending

**Check**:
1. PDF file exists in `public/` folder
2. File name is exactly `3rd-eye-security-brochure.pdf`
3. File size < 16MB

**Solution**: Add PDF file or check logs for errors

### Issue: Participant not visible in frontend

**Check**:
1. Database has the participant record
2. Frontend is connected to same Supabase project
3. Contest ID matches

**Solution**: Verify database connection and contest ID

---

## 📊 Database Queries

### View All Participants

```sql
SELECT * FROM participants 
ORDER BY entry_timestamp DESC;
```

### View Participants for Contest

```sql
SELECT p.*, c.name as contest_name
FROM participants p
JOIN contests c ON p.contest_id = c.id
WHERE c.id = 'your-contest-id';
```

### Count Participants

```sql
SELECT COUNT(*) as total_participants
FROM participants
WHERE contest_id = 'your-contest-id';
```

---

## 🚀 Deployment

### Before Deploying

1. ✅ Add brochure PDF to `public/` folder
2. ✅ Set all environment variables
3. ✅ Test the flow end-to-end
4. ✅ Verify database connection
5. ✅ Configure WhatsApp webhook

### Deploy Steps

1. Push code to repository
2. Deploy to your hosting platform (Railway, Heroku, etc.)
3. Set environment variables in hosting dashboard
4. Configure WhatsApp webhook URL
5. Test with real WhatsApp number

---

## 📈 Future Enhancements

Possible additions:
- [ ] Multiple contest support (let user choose)
- [ ] Email collection
- [ ] Terms and conditions acceptance
- [ ] Referral system
- [ ] Automated winner selection
- [ ] Winner notification via WhatsApp

---

## 📞 Support

### Common Commands

```bash
# Start server
npm run dev

# Test webhook
curl -X POST http://localhost:3001/api/webhook/test-text \
  -H "Content-Type: application/json" \
  -d '{"message": "Join", "phoneNumber": "+1234567890"}'

# Check logs
# Server logs show all flow steps
```

### Need Help?

1. Check server logs for errors
2. Verify environment variables
3. Test with curl commands
4. Check database for participant records

---

## ✅ Summary

**Flow**: Join → Name → Confirmation → Brochure

**Database**: Participants stored with name and phone number

**Visibility**: Data appears in Contest and Participants pages

**Simple**: No complex triggers or message library

**Reliable**: Graceful error handling and fallbacks

---

**Status**: ✅ Fully Implemented and Ready to Use!

**Last Updated**: November 6, 2025

# 🌧️ Rain Market Creator

אפליקציה ליצירת prediction markets על פרוטוקול Rain ב-Arbitrum One.

## מה זה עושה?

- **התחברות לארנק** - דרך MetaMask או WalletConnect
- **יצירת Markets** - פובליק או פרטי, עם אפשרויות מרובות
- **תצוגת החזקות** - ארנק חיצוני (EOA) + ארנק פנימי (Rain Smart Account)
- **ניהול pools** - הוספת נזילות וצפייה ב-markets קיימים
- **אינטגרציה מלאה** - Rain SDK עם כל הפיצ'רים

## דרישות

- Node.js v18+
- MetaMask או ארנק תומך Web3 אחר
- USDT על Arbitrum One לנזילות ראשונית

## התקנה והרצה

```bash
# התקנת תלותויות
npm install

# הרצת השרת הזמני
npm run dev
```

השרת יעלה על: **http://localhost:3000**

## שימוש

1. **התחבר לארנק** - לחץ על "התחבר לארנק"
   - השרת יבקש מעבר ל-Arbitrum One אם אתה לא שם
   
2. **צפה בארנקים**
   - **ארנק חיצוני** - הכתובת הרגילה שלך (EOA)
   - **ארנק פנימי** - Rain יוצר לך smart account פנימי אוטומטית

3. **צור Market**
   - הזן שאלה (למשל: "האם ETH יגיע ל-$10k עד סוף 2026?")
   - הוסף אפשרויות (לפחות 3)
   - בחר פובליק/פרטי
   - קבע נזילות ראשונית (מינימום 10 USDT)
   - לחץ "יצירת Market"
   - אשר את הטרנזקציות ב-MetaMask

4. **צפה ב-Markets**
   - כל ה-markets הפעילים מופיעים למטה
   - נפח מסחר, נזילות, סטטוס

## ארכיטקטורה

### Backend (server.js)
- **Express API** - שרת REST זמני
- **Rain SDK Integration** - חיבור לפרוטוקול Rain
- **Endpoints:**
  - `GET /api/markets` - רשימת markets
  - `GET /api/markets/:id` - פרטי market
  - `GET /api/markets/:id/prices` - מחירי options
  - `GET /api/positions/:address` - החזקות של ארנק
  - `GET /api/balance/:address` - יתרת USDT
  - `POST /api/build-create-market` - בניית טרנזקציית market
  - `POST /api/build-buy` - בניית טרנזקציית קניה
  - `POST /api/build-approval` - בניית טרנזקציית אישור

### Frontend (public/index.html)
- **Vanilla JS + MetaMask** - ללא frameworks
- **UI בעברית** - ממשק מלא RTL
- **Real-time updates** - רענון אוטומטי אחרי יצירת market

## Rain SDK Features

האפליקציה משתמשת ב-3 rain skills:

1. **rain-data** - שאילתות מידע על markets
2. **rain-create-market** - יצירת markets חדשים
3. **rain-trade** - קנייה, מכירה, limit orders

## המשך פיתוח

כרגע זה **שרת זמני** לבדיקות. בהמשך:

- [ ] העברה ל-production server
- [ ] הוספת WalletConnect מלא
- [ ] הוספת limit orders UI
- [ ] גרפים של מחירים
- [ ] ניהול positions
- [ ] Claim winnings
- [ ] Smart account (AA) integration
- [ ] ממשק למספר markets בבת אחת

## קישורים

- **Rain Protocol**: https://rain.one
- **Arbitrum One Explorer**: https://arbiscan.io
- **Rain SDK Docs**: https://github.com/buidlrrr/rain-sdk

---

**נוצר על ידי Joni 🐙**

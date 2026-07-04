# 04 — Business Models (Pre-built Data Schemas)

## Phone Distribution (OPPO)
```json
{
  "users":       { "id", "name", "phone", "role": "admin|dealer|retailer", "password", "area" },
  "products":    { "id", "name", "model", "price", "stock", "imei", "color", "image" },
  "dealers":     { "id", "name", "phone", "area", "creditLimit", "balance" },
  "retailers":   { "id", "name", "phone", "area", "dealerId" },
  "orders":      { "id", "userId", "items", "total", "status", "date", "paymentMethod" },
  "payments":    { "id", "amount", "method", "reference", "date", "userId" },
  "stock_movements": { "id", "productId", "type": "in|out", "qty", "date", "note" }
}
```

## E-commerce Shop
```json
{
  "users":       { "id", "name", "email", "phone", "address" },
  "products":    { "id", "name", "category", "price", "stock", "image", "description" },
  "categories":  { "id", "name", "icon" },
  "cart":        { "id", "userId", "items": [{ "productId", "qty", "price" }] },
  "orders":      { "id", "userId", "items", "total", "status", "address", "date" },
  "reviews":     { "id", "productId", "userId", "rating", "comment" }
}
```

## Food Delivery
```json
{
  "users":       { "id", "name", "phone", "address" },
  "restaurants": { "id", "name", "categories", "rating", "deliveryTime", "minOrder" },
  "menu_items":  { "id", "restaurantId", "name", "price", "category", "image" },
  "cart":        { "id", "userId", "items": [{ "menuItemId", "qty", "price" }] },
  "orders":      { "id", "userId", "restaurantId", "items", "total", "status", "deliveryAddress", "driverId" },
  "drivers":     { "id", "name", "phone", "vehicle", "status": "available|busy" }
}
```

## Doctor Appointment
```json
{
  "users":       { "id", "name", "phone", "email" },
  "doctors":     { "id", "name", "specialty", "qualification", "fee", "availableSlots" },
  "appointments": { "id", "userId", "doctorId", "date", "time", "status": "pending|confirmed|cancelled", "symptoms" },
  "prescriptions": { "id", "appointmentId", "medicines", "notes", "date" }
}
```

## Ride Booking
```json
{
  "users":       { "id", "name", "phone" },
  "drivers":     { "id", "name", "phone", "vehicle", "plate", "status": "available|busy" },
  "rides":       { "id", "userId", "driverId", "pickup", "dropoff", "fare", "status": "requested|accepted|started|completed", "rating" },
  "payments":    { "id", "rideId", "amount", "method", "status" }
}
```

## Chat/Messaging
```json
{
  "users":       { "id", "name", "avatar", "status": "online|offline" },
  "chats":       { "id", "participants": ["userId1", "userId2"], "lastMessage", "lastTime" },
  "messages":    { "id", "chatId", "senderId", "text", "image?", "timestamp", "read": false }
}
```

## Education/Quiz
```json
{
  "users":       { "id", "name", "email", "role": "student|teacher" },
  "courses":     { "id", "title", "description", "teacherId", "lessons" },
  "lessons":     { "id", "courseId", "title", "content", "videoUrl?" },
  "quizzes":     { "id", "lessonId", "questions": [{ "q", "options": ["a","b","c","d"], "answer" }] },
  "results":     { "id", "userId", "quizId", "score", "total", "date" }
}
```

## Inventory
```json
{
  "users":       { "id", "name", "role": "admin|staff" },
  "products":    { "id", "name", "sku", "category", "stock", "minStock", "price", "supplier" },
  "suppliers":   { "id", "name", "phone", "address" },
  "purchase_orders": { "id", "supplierId", "items", "total", "status", "date" },
  "stock_movements": { "id", "productId", "type": "in|out|adjustment", "qty", "reason", "date" }
}
```

## Hotel Booking
```json
{
  "users":       { "id", "name", "email", "phone" },
  "rooms":       { "id", "type": "single|double|suite", "price", "amenities", "available": true|false },
  "bookings":    { "id", "userId", "roomId", "checkIn", "checkOut", "guests", "total", "status": "pending|confirmed|cancelled" },
  "payments":    { "id", "bookingId", "amount", "method", "date" }
}
```

## Job Portal
```json
{
  "users":       { "id", "name", "email", "phone", "role": "employer|jobseeker" },
  "jobs":        { "id", "employerId", "title", "company", "location", "type": "fulltime|parttime|contract", "salary", "description", "requirements", "deadline" },
  "applications": { "id", "jobId", "userId", "resume", "status": "pending|reviewed|shortlisted|rejected", "date" },
  "employers":   { "id", "companyName", "industry", "website", "logo" }
}
```

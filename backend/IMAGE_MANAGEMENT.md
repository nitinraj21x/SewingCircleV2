# Image Management API

This document describes the dedicated image management endpoints added to the Sewing Circle backend.

## Overview

The image management system provides endpoints for serving, deleting, and cleaning up image files. It includes:
- File type and size validation
- Protection against directory traversal attacks
- Prevention of deleting images in use by events
- Automatic cleanup of orphaned images
- Automatic image deletion when events are deleted

## Endpoints

### GET /api/images/:filename

Serves an image file from the uploads directory.

**Authentication:** Not required (public endpoint)

**Parameters:**
- `filename` (path parameter): The name of the image file to retrieve

**Validation:**
- Filename must not contain directory traversal characters (`..`, `/`, `\`)
- File extension must be one of: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- File size must not exceed 10MB

**Response:**
- **200 OK**: Returns the image file with appropriate content type
- **400 Bad Request**: Invalid filename or file type
- **404 Not Found**: Image file does not exist
- **413 Payload Too Large**: File exceeds size limit
- **500 Internal Server Error**: Server error

**Headers:**
- `Content-Type`: Appropriate MIME type for the image
- `Cache-Control`: `public, max-age=31536000` (1 year cache)

**Example:**
```bash
GET /api/images/event-photo-123.jpg
```

### DELETE /api/images/:filename

Deletes an image file from the uploads directory.

**Authentication:** Required (admin only)

**Parameters:**
- `filename` (path parameter): The name of the image file to delete

**Validation:**
- Filename must not contain directory traversal characters
- File extension must be one of: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- Image must not be referenced by any events (coverImage or gallery)

**Response:**
- **200 OK**: Image deleted successfully
  ```json
  {
    "success": true,
    "message": "Image deleted successfully",
    "filename": "event-photo-123.jpg"
  }
  ```
- **400 Bad Request**: Invalid filename or file type
- **401 Unauthorized**: Missing or invalid authentication token
- **404 Not Found**: Image file does not exist
- **409 Conflict**: Image is being used by one or more events
  ```json
  {
    "message": "Cannot delete image: it is being used by one or more events",
    "code": "IMAGE_IN_USE",
    "eventsCount": 2,
    "eventIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
  }
  ```
- **500 Internal Server Error**: Server error

**Example:**
```bash
DELETE /api/images/old-photo.jpg
Authorization: Bearer <token>
```

### POST /api/images/cleanup

Cleans up orphaned images (images not referenced by any events).

**Authentication:** Required (admin only)

**Response:**
- **200 OK**: Cleanup completed
  ```json
  {
    "success": true,
    "message": "Cleanup completed",
    "totalImages": 50,
    "usedImages": 35,
    "orphanedImages": 15,
    "deletedImages": 15,
    "deletedFiles": ["orphan1.jpg", "orphan2.png", ...],
    "errors": []
  }
  ```
- **401 Unauthorized**: Missing or invalid authentication token
- **500 Internal Server Error**: Server error

**Example:**
```bash
POST /api/images/cleanup
Authorization: Bearer <token>
```

## Event Deletion with Image Cleanup

When an event is deleted via `DELETE /api/admin/events/:id`, the system automatically:
1. Collects all images referenced by the event (coverImage and gallery)
2. Deletes the event from the database
3. Attempts to delete all associated image files
4. Returns a summary of deleted and failed images

**Response:**
```json
{
  "message": "Event deleted successfully",
  "deletedImages": 3,
  "failedImages": []
}
```

If some images fail to delete (e.g., already deleted or permission issues), they are reported in `failedImages`:
```json
{
  "message": "Event deleted successfully",
  "deletedImages": 2,
  "failedImages": [
    {
      "filename": "missing.jpg",
      "error": "ENOENT: no such file or directory"
    }
  ]
}
```

## Security Features

### Directory Traversal Protection
All endpoints validate filenames to prevent directory traversal attacks:
- Rejects filenames containing `..`, `/`, or `\`
- Only serves files from the uploads directory

### File Type Validation
Only allows specific image file types:
- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.webp`

### Size Validation
- Maximum file size: 10MB
- Prevents serving excessively large files

### Reference Checking
Before deleting an image, the system checks if it's referenced by any events:
- Checks `coverImage` field
- Checks `gallery` array
- Returns 409 Conflict if image is in use

## Implementation Details

### File Storage
Images are stored in the `uploads/` directory with the following structure:
```
uploads/
├── image1.jpg
├── image2.png
└── subdirectories/
    └── image3.jpg
```

### Database References
Events reference images using relative paths:
```javascript
{
  coverImage: "/uploads/event-photo.jpg",
  gallery: [
    "/uploads/gallery1.jpg",
    "/uploads/gallery2.jpg"
  ]
}
```

### Cleanup Algorithm
The cleanup endpoint:
1. Scans the uploads directory for image files
2. Queries all events from the database
3. Builds a set of used image filenames
4. Identifies orphaned images (not in the used set)
5. Deletes orphaned images
6. Reports results

## Testing

Comprehensive tests are provided in:
- `routes/images.test.js` - Tests for image management endpoints
- `routes/admin-delete.test.js` - Tests for event deletion with image cleanup

Run tests with:
```bash
npm test -- routes/images.test.js
npm test -- routes/admin-delete.test.js
```

## Requirements Validation

This implementation satisfies the following requirements:

**Requirement 5.4**: Image Handler shall store images in a retrievable format for display
- ✅ Images served via GET /api/images/:filename
- ✅ Proper content types and caching headers

**Requirement 5.5**: When events are deleted, Image Handler shall clean up associated image files
- ✅ Automatic cleanup on event deletion
- ✅ Manual cleanup via POST /api/images/cleanup
- ✅ Protection against deleting images in use

## Future Enhancements

Potential improvements for future versions:
1. Image optimization and resizing
2. Cloud storage integration (S3, Cloudinary)
3. CDN integration for better performance
4. Image metadata extraction
5. Thumbnail generation
6. Batch upload support
7. Image compression

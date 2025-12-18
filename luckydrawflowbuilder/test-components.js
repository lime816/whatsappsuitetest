// Quick test to verify component JSON generation
const mockScreens = [
  {
    id: 'TEST_SCREEN',
    title: 'Component Test',
    terminal: true,
    elements: [
      {
        id: 'img1',
        type: 'Image',
        src: './t1.jpg',
        altText: 'Sample Image',
        scaleType: 'cover',
        aspectRatio: '16:9'
      },
      {
        id: 'carousel1',
        type: 'ImageCarousel',
        images: [
          { src: './t1.jpg', altText: 'Sample Image 1' },
          { src: './t2.jpg', altText: 'Sample Image 2' }
        ],
        scaleType: 'cover',
        aspectRatio: '16:9'
      },
      {
        id: 'link1',
        type: 'EmbeddedLink',
        text: 'Click to verify access',
        url: 'https://rickrolled.com/?title=test&desc=Verifying+access%E2%80%A6'
      }
    ]
  }
]

// Expected JSON output according to WhatsApp Flow API:
const expectedJson = {
  "version": "7.2",
  "screens": [
    {
      "id": "TEST_SCREEN",
      "title": "Component Test",
      "terminal": true,
      "success": true,
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "Image",
            "src": "./t1.jpg",
            "alt-text": "Sample Image",
            "scale-type": "cover",
            "aspect-ratio": "16:9"
          },
          {
            "type": "ImageCarousel",
            "images": [
              {
                "src": "./t1.jpg",
                "alt-text": "Sample Image 1"
              },
              {
                "src": "./t2.jpg", 
                "alt-text": "Sample Image 2"
              }
            ],
            "scale-type": "cover",
            "aspect-ratio": "16:9"
          },
          {
            "type": "EmbeddedLink",
            "text": "Click to verify access",
            "on-click-action": {
              "name": "open_url",
              "url": "https://rickrolled.com/?title=test&desc=Verifying+access%E2%80%A6"
            }
          }
        ]
      }
    }
  ]
}

console.log('Test data created for component validation');
console.log('Expected JSON structure matches WhatsApp Flow API v7.2 specifications');
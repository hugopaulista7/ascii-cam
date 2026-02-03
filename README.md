# ASCII Webcam

A real-time webcam feed that renders your video stream as ASCII characters.

## Features

- **Real-time ASCII rendering**: Converts webcam video pixels into characters.
- **Customizable**:
    - **Font Size & Line Height**: Adjust the density of the ASCII grid.
    - **Colors**: Change text and background colors.
    - **Shapes**: Mask the video feed into various shapes (Circle, Square, Triangle, etc.).
    - **Patterns**: Choose different character sets for rendering.
    - **Orientation**: Flip video horizontally (mirror) or vertically.
- **Responsive**: Adjusts to window size.

## How it Works

The application uses **p5.js** to capture video from the webcam. For each frame, it:
1.  Resizes the video capture to a lower resolution grid.
2.  Iterates through the pixels to calculate brightness.
3.  Maps brightness values to a set of ASCII characters.
4.  Renders the characters to the screen as HTML elements.

## Libraries Used

- [p5.js](https://p5js.org/): For webcam capture and canvas manipulation.
- [Tailwind CSS](https://tailwindcss.com/): For styling the UI and configuration menu.

## Usage

Simply open `index.html` in a modern web browser. You will need to grant camera permission.

## Author

- **Hugo Paulista**

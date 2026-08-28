export const CURATED_TAGS = [
  'arduino',
  'raspberry-pi',
  'esp32',
  'esp8266',
  'stm32',
  'usb-c',
  'rp2040',
  'nrf52',
  'atmega328',
  'ftdi',
  'qwiic',
  'stemma',
  'lis2dh12',
  'ws2812',
  'tft',
  'lipo',
  'can-bus',
  'i2c',
  'spi',
  'uart',
  'lora',
  'bluetooth',
  'wifi',
  'lipo-charger',
  'motor-driver',
  'power-supply',
  'buck-converter',
  'usb-hub',
  'audio-amplifier',
  'oled-display',
  'gps',
  'accelerometer',
  'temperature-sensor',
  'rgb-led',
  'servo-controller',
  'breakout-board'
]

export function normalizeTag (tag) {
  return tag.toLowerCase()
}

export function isCuratedTag (tag) {
  return CURATED_TAGS.includes(normalizeTag(tag))
}

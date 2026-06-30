# 墨の群れ — The Ink Flock

Generative sumi-e (ink-wash) world ที่วาดด้วย p5.js บน HTML5 canvas มีทั้งฝูงนก (Birds) และฝูงปลาคาร์ฟ (Koi) ที่เคลื่อนไหวแบบ real-time ด้วยกฎของ Boids พร้อมแปรงหมึกที่ขรุขระเหมือนกระดาษ washi และแสตมป์ hanko สีแดง

## What’s inside

- **Birds** — นกบินรวมฝูงผ่านท้องฟ้า ติดตาม cursor ของผู้ใช้ และกระจายตัวเมื่อคลิก
- **Koi** — ปลาคาร์ฟว่ายวนในน้ำ เกิด ripple เมื่อ cursor ลากผ่าน และ splash สีน้ำเมื่อคลิก
- **Herd mode (in code)** — fallback mode สำหรับตัวอย่างฝูงสัตว์เลี้ยงลูกด้วยนม

ทั้งหมด render ด้วย p5.js โดยใช้ `p5.brush` สำหรับลายแปรงหมึกบนพื้นหลัง และใช้ native `drawingContext.clip()` สำหรับ pattern บนลำตัวปลาคาร์ฟ

## Run

```bash
pnpm install
pnpm dev
# เปิด http://localhost:5173
```

หรือเปิดไฟล์ static โดยตรง:

```bash
open index.html
```

สำหรับ mode โดยตรง:

```bash
open bird_p5.html
open koi_p5.html
```

## Controls

- **Move mouse** — นำทางฝูง / สร้าง ripple ใน Koi mode
- **Click / hold** — กระจายหมึก / ink splash
- **T** — แสดง/ซ่อน Flock tuner (separation, alignment, cohesion, count, FOV)

## Build & Test

```bash
pnpm build      # TypeScript compile + Vite build → dist/
pnpm typecheck  # ตรวจ type อย่างเดียว
pnpm test       # Vitest unit tests
pnpm coverage   # รายงาน coverage
```

## Project structure

```
src/
  p5/             # p5.js rendering layer
    main.ts       # entry sketch สำหรับ bird_p5.html / koi_p5.html
    background.ts # washi paper + ภูเขา + พระอาทิตย์
    brush.ts      # dab/stroke helpers สำหรับ ink shapes
    renderers.ts  # drawBird / drawKoi / drawHerd
    effects.ts    # ripple, ink burst, splash
    trail.ts      # fade-out trail buffer
  agents.ts       # agent data model
  physics.ts      # boids steering (sep/ali/coh/mouse)
  modes.ts        # mode configs (birds/koi/herd)
  tuner.ts        # HTML tuner panel
  landing-pointer.ts # landing page cursor effect
index.html        # landing page
bird_p5.html      # birds mode
koi_p5.html       # koi mode
```

## สิ่งที่สำคัญที่สุด — References & Inspiration

โปรเจกต์นี้เริ่มต้นมาจากผลงาน **Claude Fable 5** ของ [Peter Ong](https://peterong.dev/) ที่ `https://demo.peterong.dev/claude/` ซึ่งเป็นดีโมที่เปรียบเทียบงาน generative art สไตล์ sumi-e ระหว่าง Claude และ ChatGPT เราดึงเอาฉาก **Birds** — ฝูงนกหมึกที่บินอยู่เหนือกระดาษ washi — มาเป็นจุดเริ่มต้น จากนั้นขยายเป็น multi-mode world ที่มี Koi และ interactive tuning

| แหล่งที่มา | บทบาทในโปรเจกต์ |
|---|---|
| [Peter Ong — Claude Fable 5](https://demo.peterong.dev/claude/) | แรงบันดาลใจหลัก คอนเซ็ปต์ sumi-e generative art, ฉาก Birds, typography ญี่ปุ่น, hanko seal |
| [p5.js](https://p5js.org/) | creative coding framework ที่ใช้ render ทั้งหมด |
| [p5.brush](https://github.com/processing/p5.brush) | library สำหรับ natural media brushes (ink, charcoal, watercolor fills, hatch) ใช้วาดพื้นหลังและลายหมึก |
| [Craig Reynolds — Boids (1986)](https://www.red3d.com/craig/boids/) | อัลกอริทึม flocking ที่ agent ใช้: separation, alignment, cohesion |
| Sumi-e / ซูมิ-เอะ (Japanese ink wash painting) | ภาษาทัศนศิลป์: โทนหมึกดำ-เทา, กระดาษ washi, แสตมป์ hanko, การเว้นช่องว่าง |
| Ukiyo-e & nishiki-e woodblock prints | สีสันของ Koi mode (ส้ม, ทอง, น้ำเงิน) และการใช้ flat color patches |

## License

ISC

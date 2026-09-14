'use client'

import { useRef } from 'react'
import { gsap, MOTION_QUERY, motionOff, useGSAP } from '@/lib/motion'
import styles from './Grain.module.css'

// Film grain looks better slow and costs less.
const FPS = 12

const VERTEX = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'
// Monochrome per pixel noise, a new seed every frame (hash without sine, Dave Hoskins).
const FRAGMENT = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform float s;
float h(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
void main(){gl_FragColor=vec4(vec3(h(gl_FragCoord.xy+vec2(s,s*1.7))),1.);}`

type Stop = () => void

/** Compiles the grain program on a full canvas triangle; null when WebGL is not available. */
function createGrain(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: 'low-power',
    preserveDrawingBuffer: false,
  })
  if (!gl) return null
  const program = gl.createProgram()
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX],
    [gl.FRAGMENT_SHADER, FRAGMENT],
  ] as const) {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    gl.attachShader(program, shader)
  }
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  const seed = gl.getUniformLocation(program, 's')

  return {
    // One canvas pixel per CSS pixel; `image-rendering: pixelated` keeps the grain crisp on 2x.
    resize() {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight))
      gl.viewport(0, 0, canvas.width, canvas.height)
    },
    draw() {
      gl.uniform1f(seed, Math.random() * 1000)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    destroy() {
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}

/** Runs the grain while the canvas is on screen and the tab is visible. */
function run(canvas: HTMLCanvasElement): Stop {
  const grain = createGrain(canvas)
  if (!grain) return () => undefined
  grain.resize()
  grain.draw()
  canvas.classList.add(styles.on ?? '')

  let frame = 0
  let last = 0
  let onScreen = false
  const loop = (time: number) => {
    frame = requestAnimationFrame(loop)
    if (time - last < 1000 / FPS) return
    last = time
    grain.draw()
  }
  const update = () => {
    const play = onScreen && document.visibilityState === 'visible'
    if (play && !frame) frame = requestAnimationFrame(loop)
    if (!play && frame) {
      cancelAnimationFrame(frame)
      frame = 0
    }
  }
  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? false
    update()
  })
  visibility.observe(canvas)
  const size = new ResizeObserver(() => {
    grain.resize()
    grain.draw()
  })
  size.observe(canvas)
  document.addEventListener('visibilitychange', update)

  return () => {
    cancelAnimationFrame(frame)
    visibility.disconnect()
    size.disconnect()
    document.removeEventListener('visibilitychange', update)
    canvas.classList.remove(styles.on ?? '')
    grain.destroy()
  }
}

// Flag heroGrain: animated film grain over the hero turquoise, behind the text. Starts after first
// paint when the browser is idle, so it never competes with the LCP; nothing under reduced motion,
// ?motion=off or without WebGL.
export function Grain() {
  const ref = useRef<HTMLCanvasElement>(null)

  useGSAP(() => {
    const canvas = ref.current
    if (!canvas) return
    const mm = gsap.matchMedia()
    mm.add(MOTION_QUERY, () => {
      if (motionOff()) return
      let stop: Stop | undefined
      const start = () => (stop = run(canvas))
      // Safari has no requestIdleCallback.
      const idle = 'requestIdleCallback' in window
      const id = idle
        ? requestIdleCallback(start, { timeout: 2000 })
        : window.setTimeout(start, 500)
      return () => {
        if (idle) cancelIdleCallback(id)
        else window.clearTimeout(id)
        stop?.()
      }
    })
  })

  return <canvas ref={ref} className={styles.grain} aria-hidden data-grain />
}

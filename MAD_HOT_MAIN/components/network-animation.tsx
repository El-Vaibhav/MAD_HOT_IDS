"use client"

import { useEffect, useRef } from "react"

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  connections: number[]
}

interface Packet {
  fromNode: number
  toNode: number
  progress: number
  speed: number
}

export function NetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let nodes: Node[] = []
    let packets: Packet[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    const initNodes = () => {
      const nodeCount = Math.min(25, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 20000))
      nodes = []
      
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 1,
          connections: [],
        })
      }

      // Create connections
      nodes.forEach((node, i) => {
        const connectionCount = Math.floor(Math.random() * 3) + 1
        const distances = nodes
          .map((other, j) => ({
            index: j,
            dist: Math.hypot(other.x - node.x, other.y - node.y),
          }))
          .filter((d) => d.index !== i)
          .sort((a, b) => a.dist - b.dist)
          .slice(0, connectionCount)

        node.connections = distances.map((d) => d.index)
      })
    }

    const spawnPacket = () => {
      if (packets.length < 15 && nodes.length > 1) {
        const fromNode = Math.floor(Math.random() * nodes.length)
        const node = nodes[fromNode]
        if (node.connections.length > 0) {
          const toNode = node.connections[Math.floor(Math.random() * node.connections.length)]
          packets.push({
            fromNode,
            toNode,
            progress: 0,
            speed: Math.random() * 0.02 + 0.01,
          })
        }
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Draw connections
      ctx.strokeStyle = "rgba(0, 200, 220, 0.1)"
      ctx.lineWidth = 0.5
      nodes.forEach((node) => {
        node.connections.forEach((connIndex) => {
          const other = nodes[connIndex]
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(other.x, other.y)
          ctx.stroke()
        })
      })

      // Draw nodes
      nodes.forEach((node) => {
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(0, 220, 240, 0.6)"
        ctx.fill()

        // Glow effect
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(0, 220, 240, 0.1)"
        ctx.fill()
      })

      // Draw packets
      packets.forEach((packet) => {
        const from = nodes[packet.fromNode]
        const to = nodes[packet.toNode]
        const x = from.x + (to.x - from.x) * packet.progress
        const y = from.y + (to.y - from.y) * packet.progress

        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(0, 255, 255, 0.9)"
        ctx.fill()

        // Packet glow
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(0, 255, 255, 0.3)"
        ctx.fill()
      })

      // Update nodes
      nodes.forEach((node) => {
        node.x += node.vx
        node.y += node.vy

        if (node.x < 0 || node.x > canvas.offsetWidth) node.vx *= -1
        if (node.y < 0 || node.y > canvas.offsetHeight) node.vy *= -1

        node.x = Math.max(0, Math.min(canvas.offsetWidth, node.x))
        node.y = Math.max(0, Math.min(canvas.offsetHeight, node.y))
      })

      // Update packets
      packets = packets.filter((packet) => {
        packet.progress += packet.speed
        return packet.progress < 1
      })

      if (Math.random() < 0.1) spawnPacket()

      animationId = requestAnimationFrame(draw)
    }

    resize()
    initNodes()
    draw()

    window.addEventListener("resize", () => {
      resize()
      initNodes()
    })

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ width: "100%", height: "100%" }}
    />
  )
}

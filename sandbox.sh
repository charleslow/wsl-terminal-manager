#!/bin/bash
# Helper script to manage the Claude sandbox environment

set -e

case "$1" in
    build)
        echo "Building Claude sandbox image..."
        docker compose build
        ;;
    start)
        echo "Starting Claude sandbox..."
        docker compose up -d
        docker compose exec claude-sandbox bash
        ;;
    stop)
        echo "Stopping Claude sandbox..."
        docker compose down
        ;;
    shell)
        echo "Attaching to Claude sandbox..."
        docker compose exec claude-sandbox bash
        ;;
    logs)
        docker compose logs -f
        ;;
    clean)
        echo "Removing Claude sandbox and volumes..."
        docker compose down -v
        ;;
    *)
        echo "Usage: $0 {build|start|stop|shell|logs|clean}"
        echo ""
        echo "Commands:"
        echo "  build  - Build the Docker image"
        echo "  start  - Start container and attach shell"
        echo "  stop   - Stop the container"
        echo "  shell  - Attach to running container"
        echo "  logs   - Show container logs"
        echo "  clean  - Remove container and volumes"
        exit 1
        ;;
esac

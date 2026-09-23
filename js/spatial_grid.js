// High-performance Spatial Grid Partitioning for Collision Detection
class SpatialGrid {
    constructor(cellSize = 96) {
        this.cellSize = cellSize;
        this.cells = new Map();
    }

    clear() {
        this.cells.clear();
    }

    _getKey(x, y) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        return `${cx},${cy}`;
    }

    insert(entity) {
        const key = this._getKey(entity.x, entity.y);
        let list = this.cells.get(key);
        if (!list) {
            list = [];
            this.cells.set(key, list);
        }
        list.push(entity);
    }

    // Query all entities within circle centered at (x, y) with radius r
    queryRadius(x, y, radius) {
        const results = [];
        const minCx = Math.floor((x - radius) / this.cellSize);
        const maxCx = Math.floor((x + radius) / this.cellSize);
        const minCy = Math.floor((y - radius) / this.cellSize);
        const maxCy = Math.floor((y + radius) / this.cellSize);

        const rSq = radius * radius;

        for (let cx = minCx; cx <= maxCx; cx++) {
            for (let cy = minCy; cy <= maxCy; cy++) {
                const key = `${cx},${cy}`;
                const list = this.cells.get(key);
                if (list) {
                    for (let i = 0; i < list.length; i++) {
                        const ent = list[i];
                        const dx = ent.x - x;
                        const dy = ent.y - y;
                        if (dx * dx + dy * dy <= rSq) {
                            results.push(ent);
                        }
                    }
                }
            }
        }
        return results;
    }

    // Query closest entity within radius
    queryClosest(x, y, radius) {
        let closest = null;
        let closestDistSq = radius * radius;

        const minCx = Math.floor((x - radius) / this.cellSize);
        const maxCx = Math.floor((x + radius) / this.cellSize);
        const minCy = Math.floor((y - radius) / this.cellSize);
        const maxCy = Math.floor((y + radius) / this.cellSize);

        for (let cx = minCx; cx <= maxCx; cx++) {
            for (let cy = minCy; cy <= maxCy; cy++) {
                const key = `${cx},${cy}`;
                const list = this.cells.get(key);
                if (list) {
                    for (let i = 0; i < list.length; i++) {
                        const ent = list[i];
                        const dx = ent.x - x;
                        const dy = ent.y - y;
                        const dSq = dx * dx + dy * dy;
                        if (dSq <= closestDistSq) {
                            closestDistSq = dSq;
                            closest = ent;
                        }
                    }
                }
            }
        }
        return closest;
    }
}

window.SpatialGrid = SpatialGrid;

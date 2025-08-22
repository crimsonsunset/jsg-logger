#!/usr/bin/env node

/**
 * Simple development server for testing JSG Logger DevTools
 * Serves files with proper MIME types for ES modules
 */

import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 5555;
const HOST = 'localhost';
const execAsync = promisify(exec);

/**
 * Kill any existing process using the specified port
 * @param {number} port - Port to clear
 */
async function killExistingProcess(port) {
    try {
        console.log(`🔍 Checking for existing processes on port ${port}...`);
        
        // Find process using the port
        const { stdout: pids } = await execAsync(`lsof -ti:${port}`);
        
        if (pids.trim()) {
            console.log(`🔧 Found existing process(es) on port ${port}, terminating...`);
            
            // Kill the processes
            await execAsync(`lsof -ti:${port} | xargs kill -9`);
            console.log(`✅ Successfully killed existing process(es) on port ${port}`);
            
            // Wait a moment for processes to fully terminate
            await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
            console.log(`✅ Port ${port} is available`);
        }
    } catch (error) {
        // If lsof returns no results, it throws an error, which is fine - no process is using the port
        if (error.code === 1 || error.message.includes('No such process')) {
            console.log(`✅ Port ${port} is available`);
        } else {
            console.warn(`⚠️  Warning: Could not check/kill processes on port ${port}:`, error.message);
        }
    }
}

// MIME types for proper ES module serving
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = createServer(async (req, res) => {
    let filePath = req.url === '/' ? '/test-devtools.html' : req.url;
    
    // Remove query parameters
    filePath = filePath.split('?')[0];
    
    // Security: prevent directory traversal
    if (filePath.includes('..')) {
        res.writeHead(400);
        res.end('Bad Request');
        return;
    }
    
    const fullPath = join(__dirname, filePath);
    const ext = extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';
    
    try {
        const data = await readFile(fullPath);
        res.writeHead(200, { 
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
        
        console.log(`✅ ${new Date().toLocaleTimeString()} - ${req.method} ${filePath} (${contentType})`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.writeHead(404);
            res.end(`File not found: ${filePath}`);
            console.log(`❌ ${new Date().toLocaleTimeString()} - 404: ${filePath}`);
        } else {
            res.writeHead(500);
            res.end('Internal Server Error');
            console.error(`💥 ${new Date().toLocaleTimeString()} - Error serving ${filePath}:`, error.message);
        }
    }
});

// Start server with automatic port cleanup
async function startServer() {
    try {
        // Kill any existing process on the port first
        await killExistingProcess(PORT);
        
        // Start the server
        server.listen(PORT, HOST, () => {
            console.log('\n🎛️ JSG Logger DevTools Development Server');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`🌐 Server running at: http://${HOST}:${PORT}`);
            console.log(`📁 Serving files from: ${__dirname}`);
            console.log('');
            console.log('🚀 Quick start:');
            console.log(`   1. Open: http://${HOST}:${PORT}`);
            console.log('   2. Click "Enable DevTools Panel"');
            console.log('   3. Look for floating 🎛️ button on left side');
            console.log('   4. Click button to open/close panel');
            console.log('   5. Test component toggles and controls');
            console.log('');
            console.log('🛑 Press Ctrl+C to stop server');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        });
        
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is still in use. Retrying port cleanup...`);
                setTimeout(async () => {
                    await killExistingProcess(PORT);
                    console.log('🔄 Retrying server start...');
                    server.listen(PORT, HOST);
                }, 2000);
            } else {
                console.error('❌ Server error:', error);
                process.exit(1);
            }
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down development server...');
    server.close(() => {
        console.log('✅ Server stopped successfully');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n\n🛑 Received SIGTERM, shutting down...');
    server.close(() => {
        process.exit(0);
    });
});

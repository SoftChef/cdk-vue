"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exec = exports.osPathJoin = exports.getVueCliVersion = exports.getNpxVersion = void 0;
const child_process_1 = require("child_process");
const os = require("os");
const path = require("path");
/**
 * Returns the installed Npx version
 */
function getNpxVersion() {
    try {
        // --no-install ensures that we are checking for an installed version
        // (either locally or globally)
        const npx = os.platform() === 'win32' ? 'npx.cmd' : 'npx';
        const npxVersion = child_process_1.spawnSync(npx, ['--version']);
        if (npxVersion.status !== 0 || npxVersion.error) {
            return undefined;
        }
        return npxVersion.stdout.toString().trim();
    }
    catch (err) {
        return undefined;
    }
}
exports.getNpxVersion = getNpxVersion;
/**
 * Returns the installed Vue-Cli-Serve version
 */
function getVueCliVersion() {
    try {
        // --no-install ensures that we are checking for an installed version
        // (either locally or globally)
        const npx = os.platform() === 'win32' ? 'npx.cmd' : 'npx';
        const vueCli = child_process_1.spawnSync(npx, ['--no-install', 'vue', '--version']);
        if (vueCli.status !== 0 || vueCli.error) {
            return undefined;
        }
        return vueCli.stdout.toString().trim();
    }
    catch (err) {
        return undefined;
    }
}
exports.getVueCliVersion = getVueCliVersion;
function osPathJoin(platform) {
    return function (...paths) {
        const joined = path.join(...paths);
        // If we are on win32 but need posix style paths
        if (os.platform() === 'win32' && platform !== 'win32') {
            return joined.replace(/\\/g, '/');
        }
        return joined;
    };
}
exports.osPathJoin = osPathJoin;
/**
 * Spawn sync with error handling
 */
function exec(cmd, args, options) {
    var _a, _b;
    const proc = child_process_1.spawnSync(cmd, args, options);
    if (proc.error) {
        throw proc.error;
    }
    if (proc.status !== 0) {
        if (proc.stdout || proc.stderr) {
            throw new Error(`[Status ${proc.status}] stdout: ${(_a = proc.stdout) === null || _a === void 0 ? void 0 : _a.toString().trim()}\n\n\nstderr: ${(_b = proc.stderr) === null || _b === void 0 ? void 0 : _b.toString().trim()}`);
        }
        throw new Error(`${cmd} exited with status ${proc.status}`);
    }
    return proc;
}
exports.exec = exec;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlEQUE0RDtBQUM1RCx5QkFBeUI7QUFDekIsNkJBQTZCO0FBRTdCOztHQUVHO0FBQ0gsU0FBZ0IsYUFBYTtJQUMzQixJQUFJO1FBQ0YscUVBQXFFO1FBQ3JFLCtCQUErQjtRQUMvQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMxRCxNQUFNLFVBQVUsR0FBRyx5QkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDakQsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsS0FBSyxFQUFFO1lBQy9DLE9BQU8sU0FBUyxDQUFDO1NBQ2xCO1FBQ0QsT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQzVDO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWixPQUFPLFNBQVMsQ0FBQztLQUNsQjtBQUNILENBQUM7QUFiRCxzQ0FhQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IsZ0JBQWdCO0lBQzlCLElBQUk7UUFDRixxRUFBcUU7UUFDckUsK0JBQStCO1FBQy9CLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzFELE1BQU0sTUFBTSxHQUFHLHlCQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBYyxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtZQUN2QyxPQUFPLFNBQVMsQ0FBQztTQUNsQjtRQUNELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUN4QztJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1osT0FBTyxTQUFTLENBQUM7S0FDbEI7QUFDSCxDQUFDO0FBYkQsNENBYUM7QUFFRCxTQUFnQixVQUFVLENBQUMsUUFBeUI7SUFDbEQsT0FBTyxVQUFTLEdBQUcsS0FBZTtRQUNoQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDbkMsZ0RBQWdEO1FBQ2hELElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLE9BQU8sSUFBSSxRQUFRLEtBQUssT0FBTyxFQUFFO1lBQ3JELE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDbkM7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDLENBQUM7QUFDSixDQUFDO0FBVEQsZ0NBU0M7QUFFRDs7R0FFRztBQUNILFNBQWdCLElBQUksQ0FBQyxHQUFXLEVBQUUsSUFBYyxFQUFFLE9BQTBCOztJQUMxRSxNQUFNLElBQUksR0FBRyx5QkFBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDM0MsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ2QsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDO0tBQ2xCO0lBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNyQixJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUM5QixNQUFNLElBQUksS0FBSyxDQUFDLFdBQVcsSUFBSSxDQUFDLE1BQU0sYUFBYSxNQUFBLElBQUksQ0FBQyxNQUFNLDBDQUFFLFFBQVEsR0FBRyxJQUFJLEVBQUUsaUJBQWlCLE1BQUEsSUFBSSxDQUFDLE1BQU0sMENBQUUsUUFBUSxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNySTtRQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFHLHVCQUF1QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztLQUM3RDtJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQVpELG9CQVlDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc3Bhd25TeW5jLCBTcGF3blN5bmNPcHRpb25zIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgKiBhcyBvcyBmcm9tICdvcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGluc3RhbGxlZCBOcHggdmVyc2lvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TnB4VmVyc2lvbigpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICB0cnkge1xuICAgIC8vIC0tbm8taW5zdGFsbCBlbnN1cmVzIHRoYXQgd2UgYXJlIGNoZWNraW5nIGZvciBhbiBpbnN0YWxsZWQgdmVyc2lvblxuICAgIC8vIChlaXRoZXIgbG9jYWxseSBvciBnbG9iYWxseSlcbiAgICBjb25zdCBucHggPSBvcy5wbGF0Zm9ybSgpID09PSAnd2luMzInID8gJ25weC5jbWQnIDogJ25weCc7XG4gICAgY29uc3QgbnB4VmVyc2lvbiA9IHNwYXduU3luYyhucHgsIFsnLS12ZXJzaW9uJ10pO1xuICAgIGlmIChucHhWZXJzaW9uLnN0YXR1cyAhPT0gMCB8fCBucHhWZXJzaW9uLmVycm9yKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gbnB4VmVyc2lvbi5zdGRvdXQudG9TdHJpbmcoKS50cmltKCk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbnN0YWxsZWQgVnVlLUNsaS1TZXJ2ZSB2ZXJzaW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRWdWVDbGlWZXJzaW9uKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHRyeSB7XG4gICAgLy8gLS1uby1pbnN0YWxsIGVuc3VyZXMgdGhhdCB3ZSBhcmUgY2hlY2tpbmcgZm9yIGFuIGluc3RhbGxlZCB2ZXJzaW9uXG4gICAgLy8gKGVpdGhlciBsb2NhbGx5IG9yIGdsb2JhbGx5KVxuICAgIGNvbnN0IG5weCA9IG9zLnBsYXRmb3JtKCkgPT09ICd3aW4zMicgPyAnbnB4LmNtZCcgOiAnbnB4JztcbiAgICBjb25zdCB2dWVDbGkgPSBzcGF3blN5bmMobnB4LCBbJy0tbm8taW5zdGFsbCcsICd2dWUnLCAnLS12ZXJzaW9uJ10pO1xuICAgIGlmICh2dWVDbGkuc3RhdHVzICE9PSAwIHx8IHZ1ZUNsaS5lcnJvcikge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIHZ1ZUNsaS5zdGRvdXQudG9TdHJpbmcoKS50cmltKCk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9zUGF0aEpvaW4ocGxhdGZvcm06IE5vZGVKUy5QbGF0Zm9ybSkge1xuICByZXR1cm4gZnVuY3Rpb24oLi4ucGF0aHM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgICBjb25zdCBqb2luZWQgPSBwYXRoLmpvaW4oLi4ucGF0aHMpO1xuICAgIC8vIElmIHdlIGFyZSBvbiB3aW4zMiBidXQgbmVlZCBwb3NpeCBzdHlsZSBwYXRoc1xuICAgIGlmIChvcy5wbGF0Zm9ybSgpID09PSAnd2luMzInICYmIHBsYXRmb3JtICE9PSAnd2luMzInKSB7XG4gICAgICByZXR1cm4gam9pbmVkLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICB9XG4gICAgcmV0dXJuIGpvaW5lZDtcbiAgfTtcbn1cblxuLyoqXG4gKiBTcGF3biBzeW5jIHdpdGggZXJyb3IgaGFuZGxpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4ZWMoY21kOiBzdHJpbmcsIGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zPzogU3Bhd25TeW5jT3B0aW9ucykge1xuICBjb25zdCBwcm9jID0gc3Bhd25TeW5jKGNtZCwgYXJncywgb3B0aW9ucyk7XG4gIGlmIChwcm9jLmVycm9yKSB7XG4gICAgdGhyb3cgcHJvYy5lcnJvcjtcbiAgfVxuICBpZiAocHJvYy5zdGF0dXMgIT09IDApIHtcbiAgICBpZiAocHJvYy5zdGRvdXQgfHwgcHJvYy5zdGRlcnIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgW1N0YXR1cyAke3Byb2Muc3RhdHVzfV0gc3Rkb3V0OiAke3Byb2Muc3Rkb3V0Py50b1N0cmluZygpLnRyaW0oKX1cXG5cXG5cXG5zdGRlcnI6ICR7cHJvYy5zdGRlcnI/LnRvU3RyaW5nKCkudHJpbSgpfWApO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7Y21kfSBleGl0ZWQgd2l0aCBzdGF0dXMgJHtwcm9jLnN0YXR1c31gKTtcbiAgfVxuICByZXR1cm4gcHJvYztcbn0iXX0=
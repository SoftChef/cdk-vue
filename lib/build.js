"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VueCliBundling = void 0;
const os = require("os");
const path = require("path");
const s3Deploy = require("@aws-cdk/aws-s3-deployment");
const cdk = require("@aws-cdk/core");
const util_1 = require("./util");
const NPX_MAJOR_VERSION = '6';
class VueCliBundling {
    constructor(props) {
        var _a, _b, _c, _d, _e;
        VueCliBundling.runsLocally = (_c = (((_a = util_1.getNpxVersion()) === null || _a === void 0 ? void 0 : _a.startsWith(NPX_MAJOR_VERSION)) && ((_b = util_1.getVueCliVersion()) === null || _b === void 0 ? void 0 : _b.startsWith('@vue/cli')))) !== null && _c !== void 0 ? _c : false;
        const bundlingArguments = (_d = props.bundlingArguments) !== null && _d !== void 0 ? _d : '';
        const bundlingCommand = this.createBundlingCommand(cdk.AssetStaging.BUNDLING_OUTPUT_DIR, bundlingArguments);
        this.image = cdk.DockerImage.fromRegistry(`${(_e = props.nodeImage) !== null && _e !== void 0 ? _e : 'public.ecr.aws/bitnami/node'}`);
        this.command = ['bash', '-c', bundlingCommand];
        this.environment = props.environment;
        if (!props.forceDockerBundling) {
            const osPlatform = os.platform();
            const createLocalCommand = (outputDir) => {
                return this.createBundlingCommand(outputDir, bundlingArguments, osPlatform);
            };
            this.local = {
                tryBundle(outputDir) {
                    if (VueCliBundling.runsLocally === false) {
                        process.stderr.write('Vue cli cannot run locally. Switching to Docker bundling.\n');
                        return false;
                    }
                    try {
                        util_1.exec(osPlatform === 'win32' ? 'cmd' : 'bash', [
                            osPlatform === 'win32' ? '/c' : '-c',
                            createLocalCommand(outputDir),
                        ], {
                            env: {
                                ...process.env,
                                ...props.environment,
                            },
                            stdio: [
                                'ignore',
                                process.stderr,
                                'inherit',
                            ],
                            cwd: path.resolve(props.source),
                            windowsVerbatimArguments: osPlatform === 'win32',
                        });
                    }
                    catch (error) {
                        return false;
                    }
                    return true;
                },
            };
        }
    }
    static bundling(options) {
        return s3Deploy.Source.asset(options.source, {
            bundling: new VueCliBundling(options),
        });
    }
    createBundlingCommand(outputDir, bundlingArguments, osPlatform = 'linux') {
        const npx = osPlatform === 'win32' ? 'npx.cmd' : 'npx';
        const vueCliServeBuildCommand = [
            npx,
            'yarn',
            'install',
            ';',
            npx,
            'vue-cli-service',
            'build',
            bundlingArguments,
            '--no-install',
            '--no-clean',
            `--dest ${outputDir}`,
        ].join(' ');
        return vueCliServeBuildCommand;
    }
}
exports.VueCliBundling = VueCliBundling;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3Qix1REFBdUQ7QUFDdkQscUNBQXFDO0FBRXJDLGlDQUErRDtBQUUvRCxNQUFNLGlCQUFpQixHQUFHLEdBQUcsQ0FBQztBQUU5QixNQUFhLGNBQWM7SUF1QnpCLFlBQVksS0FBdUI7O1FBQ2pDLGNBQWMsQ0FBQyxXQUFXLFNBQUcsQ0FBQyxPQUFBLG9CQUFhLEVBQUUsMENBQUUsVUFBVSxDQUFDLGlCQUFpQixhQUFLLHVCQUFnQixFQUFFLDBDQUFFLFVBQVUsQ0FBQyxVQUFVLEVBQUMsQ0FBQyxtQ0FBSSxLQUFLLENBQUM7UUFDckksTUFBTSxpQkFBaUIsU0FBRyxLQUFLLENBQUMsaUJBQWlCLG1DQUFJLEVBQUUsQ0FBQztRQUN4RCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQzVHLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsR0FBRyxNQUFBLEtBQUssQ0FBQyxTQUFTLG1DQUFJLDZCQUE2QixFQUFFLENBQUMsQ0FBQztRQUNqRyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7UUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRTtZQUM5QixNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDakMsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLFNBQWlCLEVBQUUsRUFBRTtnQkFDL0MsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxFQUFFLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzlFLENBQUMsQ0FBQztZQUNGLElBQUksQ0FBQyxLQUFLLEdBQUc7Z0JBQ1gsU0FBUyxDQUFDLFNBQWlCO29CQUN6QixJQUFJLGNBQWMsQ0FBQyxXQUFXLEtBQUssS0FBSyxFQUFFO3dCQUN4QyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyw2REFBNkQsQ0FBQyxDQUFDO3dCQUNwRixPQUFPLEtBQUssQ0FBQztxQkFDZDtvQkFDRCxJQUFJO3dCQUNGLFdBQUksQ0FDRixVQUFVLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFDdkM7NEJBQ0UsVUFBVSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJOzRCQUNwQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUM7eUJBQzlCLEVBQ0Q7NEJBQ0UsR0FBRyxFQUFFO2dDQUNILEdBQUcsT0FBTyxDQUFDLEdBQUc7Z0NBQ2QsR0FBRyxLQUFLLENBQUMsV0FBVzs2QkFDckI7NEJBQ0QsS0FBSyxFQUFFO2dDQUNMLFFBQVE7Z0NBQ1IsT0FBTyxDQUFDLE1BQU07Z0NBQ2QsU0FBUzs2QkFDVjs0QkFDRCxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDOzRCQUMvQix3QkFBd0IsRUFBRSxVQUFVLEtBQUssT0FBTzt5QkFDakQsQ0FDRixDQUFDO3FCQUNIO29CQUFDLE9BQU8sS0FBSyxFQUFFO3dCQUNkLE9BQU8sS0FBSyxDQUFDO3FCQUNkO29CQUNELE9BQU8sSUFBSSxDQUFDO2dCQUNkLENBQUM7YUFDRixDQUFDO1NBQ0g7SUFDSCxDQUFDO0lBbkVNLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBeUI7UUFDOUMsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FDMUIsT0FBTyxDQUFDLE1BQU0sRUFDZDtZQUNFLFFBQVEsRUFBRSxJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUM7U0FDdEMsQ0FDRixDQUFDO0lBQ0osQ0FBQztJQThETyxxQkFBcUIsQ0FBQyxTQUFpQixFQUFFLGlCQUF5QixFQUFFLGFBQThCLE9BQU87UUFDL0csTUFBTSxHQUFHLEdBQUcsVUFBVSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDdkQsTUFBTSx1QkFBdUIsR0FBVztZQUN0QyxHQUFHO1lBQ0gsTUFBTTtZQUNOLFNBQVM7WUFDVCxHQUFHO1lBQ0gsR0FBRztZQUNILGlCQUFpQjtZQUNqQixPQUFPO1lBQ1AsaUJBQWlCO1lBQ2pCLGNBQWM7WUFDZCxZQUFZO1lBQ1osVUFBVSxTQUFTLEVBQUU7U0FDdEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWixPQUFPLHVCQUF1QixDQUFDO0lBQ2pDLENBQUM7Q0FDRjtBQXhGRCx3Q0F3RkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBvcyBmcm9tICdvcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgczNEZXBsb3kgZnJvbSAnQGF3cy1jZGsvYXdzLXMzLWRlcGxveW1lbnQnO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0IHsgVnVlQ2xpQnVpbGRQcm9wcyB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgZ2V0TnB4VmVyc2lvbiwgZ2V0VnVlQ2xpVmVyc2lvbiwgZXhlYyB9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IE5QWF9NQUpPUl9WRVJTSU9OID0gJzYnO1xuXG5leHBvcnQgY2xhc3MgVnVlQ2xpQnVuZGxpbmcgaW1wbGVtZW50cyBjZGsuQnVuZGxpbmdPcHRpb25zIHtcblxuICBwdWJsaWMgc3RhdGljIGJ1bmRsaW5nKG9wdGlvbnM6IFZ1ZUNsaUJ1aWxkUHJvcHMpOiBzM0RlcGxveS5JU291cmNlIHtcbiAgICByZXR1cm4gczNEZXBsb3kuU291cmNlLmFzc2V0KFxuICAgICAgb3B0aW9ucy5zb3VyY2UsXG4gICAgICB7XG4gICAgICAgIGJ1bmRsaW5nOiBuZXcgVnVlQ2xpQnVuZGxpbmcob3B0aW9ucyksXG4gICAgICB9LFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBydW5zTG9jYWxseT86IGJvb2xlYW4gfCB0cnVlO1xuXG4gIHB1YmxpYyByZWFkb25seSBpbWFnZTogY2RrLkRvY2tlckltYWdlO1xuXG4gIHB1YmxpYyByZWFkb25seSBjb21tYW5kPzogc3RyaW5nW10gfCB1bmRlZmluZWQ7XG5cbiAgcHVibGljIHJlYWRvbmx5IGVudmlyb25tZW50PzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSB8IHt9O1xuXG4gIHB1YmxpYyByZWFkb25seSBidW5kbGluZ0FyZ3VtZW50cz86IHN0cmluZyB8ICcnO1xuXG4gIHB1YmxpYyByZWFkb25seSBsb2NhbD86IGNkay5JTG9jYWxCdW5kbGluZyB8IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogVnVlQ2xpQnVpbGRQcm9wcykge1xuICAgIFZ1ZUNsaUJ1bmRsaW5nLnJ1bnNMb2NhbGx5ID0gKGdldE5weFZlcnNpb24oKT8uc3RhcnRzV2l0aChOUFhfTUFKT1JfVkVSU0lPTikgJiYgZ2V0VnVlQ2xpVmVyc2lvbigpPy5zdGFydHNXaXRoKCdAdnVlL2NsaScpKSA/PyBmYWxzZTtcbiAgICBjb25zdCBidW5kbGluZ0FyZ3VtZW50cyA9IHByb3BzLmJ1bmRsaW5nQXJndW1lbnRzID8/ICcnO1xuICAgIGNvbnN0IGJ1bmRsaW5nQ29tbWFuZCA9IHRoaXMuY3JlYXRlQnVuZGxpbmdDb21tYW5kKGNkay5Bc3NldFN0YWdpbmcuQlVORExJTkdfT1VUUFVUX0RJUiwgYnVuZGxpbmdBcmd1bWVudHMpO1xuICAgIHRoaXMuaW1hZ2UgPSBjZGsuRG9ja2VySW1hZ2UuZnJvbVJlZ2lzdHJ5KGAke3Byb3BzLm5vZGVJbWFnZSA/PyAncHVibGljLmVjci5hd3MvYml0bmFtaS9ub2RlJ31gKTtcbiAgICB0aGlzLmNvbW1hbmQgPSBbJ2Jhc2gnLCAnLWMnLCBidW5kbGluZ0NvbW1hbmRdO1xuICAgIHRoaXMuZW52aXJvbm1lbnQgPSBwcm9wcy5lbnZpcm9ubWVudDtcbiAgICBpZiAoIXByb3BzLmZvcmNlRG9ja2VyQnVuZGxpbmcpIHtcbiAgICAgIGNvbnN0IG9zUGxhdGZvcm0gPSBvcy5wbGF0Zm9ybSgpO1xuICAgICAgY29uc3QgY3JlYXRlTG9jYWxDb21tYW5kID0gKG91dHB1dERpcjogc3RyaW5nKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUJ1bmRsaW5nQ29tbWFuZChvdXRwdXREaXIsIGJ1bmRsaW5nQXJndW1lbnRzLCBvc1BsYXRmb3JtKTtcbiAgICAgIH07XG4gICAgICB0aGlzLmxvY2FsID0ge1xuICAgICAgICB0cnlCdW5kbGUob3V0cHV0RGlyOiBzdHJpbmcpIHtcbiAgICAgICAgICBpZiAoVnVlQ2xpQnVuZGxpbmcucnVuc0xvY2FsbHkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZSgnVnVlIGNsaSBjYW5ub3QgcnVuIGxvY2FsbHkuIFN3aXRjaGluZyB0byBEb2NrZXIgYnVuZGxpbmcuXFxuJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBleGVjKFxuICAgICAgICAgICAgICBvc1BsYXRmb3JtID09PSAnd2luMzInID8gJ2NtZCcgOiAnYmFzaCcsXG4gICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBvc1BsYXRmb3JtID09PSAnd2luMzInID8gJy9jJyA6ICctYycsXG4gICAgICAgICAgICAgICAgY3JlYXRlTG9jYWxDb21tYW5kKG91dHB1dERpciksXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBlbnY6IHtcbiAgICAgICAgICAgICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAgICAgICAgICAgLi4ucHJvcHMuZW52aXJvbm1lbnQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdGRpbzogW1xuICAgICAgICAgICAgICAgICAgJ2lnbm9yZScsXG4gICAgICAgICAgICAgICAgICBwcm9jZXNzLnN0ZGVycixcbiAgICAgICAgICAgICAgICAgICdpbmhlcml0JyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGN3ZDogcGF0aC5yZXNvbHZlKHByb3BzLnNvdXJjZSksXG4gICAgICAgICAgICAgICAgd2luZG93c1ZlcmJhdGltQXJndW1lbnRzOiBvc1BsYXRmb3JtID09PSAnd2luMzInLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVCdW5kbGluZ0NvbW1hbmQob3V0cHV0RGlyOiBzdHJpbmcsIGJ1bmRsaW5nQXJndW1lbnRzOiBzdHJpbmcsIG9zUGxhdGZvcm06IE5vZGVKUy5QbGF0Zm9ybSA9ICdsaW51eCcpOiBzdHJpbmcge1xuICAgIGNvbnN0IG5weCA9IG9zUGxhdGZvcm0gPT09ICd3aW4zMicgPyAnbnB4LmNtZCcgOiAnbnB4JztcbiAgICBjb25zdCB2dWVDbGlTZXJ2ZUJ1aWxkQ29tbWFuZDogc3RyaW5nID0gW1xuICAgICAgbnB4LFxuICAgICAgJ3lhcm4nLFxuICAgICAgJ2luc3RhbGwnLFxuICAgICAgJzsnLFxuICAgICAgbnB4LFxuICAgICAgJ3Z1ZS1jbGktc2VydmljZScsXG4gICAgICAnYnVpbGQnLFxuICAgICAgYnVuZGxpbmdBcmd1bWVudHMsXG4gICAgICAnLS1uby1pbnN0YWxsJyxcbiAgICAgICctLW5vLWNsZWFuJyxcbiAgICAgIGAtLWRlc3QgJHtvdXRwdXREaXJ9YCxcbiAgICBdLmpvaW4oJyAnKTtcbiAgICByZXR1cm4gdnVlQ2xpU2VydmVCdWlsZENvbW1hbmQ7XG4gIH1cbn0iXX0=
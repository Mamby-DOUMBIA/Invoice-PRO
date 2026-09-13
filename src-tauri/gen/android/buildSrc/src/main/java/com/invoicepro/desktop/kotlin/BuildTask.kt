import java.io.File
import org.apache.tools.ant.taskdefs.condition.Os
import org.gradle.api.DefaultTask
import org.gradle.api.GradleException
import org.gradle.api.logging.LogLevel
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction

open class BuildTask : DefaultTask() {
    @Input
    var rootDirRel: String? = null
    @Input
    var target: String? = null
    @Input
    var release: Boolean? = null

    @TaskAction
    fun assemble() {
        val executable = """node""";
        try {
            runTauriCli(executable)
        } catch (e: Exception) {
            if (Os.isFamily(Os.FAMILY_WINDOWS)) {
                // Try different Windows-specific extensions
                val fallbacks = listOf(
                    "$executable.exe",
                    "$executable.cmd",
                    "$executable.bat",
                )
                
                var lastException: Exception = e
                for (fallback in fallbacks) {
                    try {
                        runTauriCli(fallback)
                        return
                    } catch (fallbackException: Exception) {
                        lastException = fallbackException
                    }
                }
                throw lastException
            } else {
                throw e;
            }
        }
    }

    fun runTauriCli(executable: String) {
        val rootDirRel = rootDirRel ?: throw GradleException("rootDirRel cannot be null")
        val target = target ?: throw GradleException("target cannot be null")
        val release = release ?: throw GradleException("release cannot be null")

        project.exec {
            val tauriRoot = File(project.projectDir, rootDirRel)
            val cliJs = File(tauriRoot, "node_modules/@tauri-apps/cli/tauri.js")
            if (!cliJs.exists()) {
                throw GradleException("Tauri CLI was not found at ${cliJs.absolutePath}. Run npm install in the project root first.")
            }

            workingDir(tauriRoot)

            val nodeExecutable = when {
                Os.isFamily(Os.FAMILY_WINDOWS) && File(tauriRoot, "node.bat").exists() -> File(tauriRoot, "node.bat").absolutePath
                Os.isFamily(Os.FAMILY_WINDOWS) && File(tauriRoot, "node.exe").exists() -> File(tauriRoot, "node.exe").absolutePath
                else -> executable
            }

            executable(nodeExecutable)
            val argsList = mutableListOf<String>()
            argsList.add(cliJs.absolutePath)
            argsList.add("android")
            argsList.add("android-studio-script")
            if (project.logger.isEnabled(LogLevel.DEBUG)) {
                argsList.add("-vv")
            } else if (project.logger.isEnabled(LogLevel.INFO)) {
                argsList.add("-v")
            }
            if (release) {
                argsList.add("--release")
            }
            argsList.add("--target")
            argsList.add(target)
            args(argsList)
        }.assertNormalExitValue()
    }
}

import SwiftUI

@main
struct ChromaApp: App {
    @State private var vm = AppViewModel(store: DataStore())

    var body: some Scene {
        WindowGroup {
            AppNavigation()
                .environment(vm)
        }
    }
}

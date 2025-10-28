import { BrowserRouter } from "react-router-dom"

import Routes from "./routes"
import { Toaster } from "./components/ui/sonner"
function App() {
  return (
    <BrowserRouter>
      <Toaster richColors expand={true} position="top-right" />
      <Routes />
    </BrowserRouter>
  )
}

export default App

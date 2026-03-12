import ClientLayout from "../components/clientLayout"

export default function RootLayout({ children }) {

return (
<html lang="en">
<body style={{margin:0}}>
<ClientLayout>
{children}
</ClientLayout>
</body>
</html>
)

}
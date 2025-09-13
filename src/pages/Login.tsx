import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useLogin } from '../services/api'
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useToast } from '../hooks/use-toast'
import { MdLocalParking } from 'react-icons/md'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { toast } = useToast()
  const loginMutation = useLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      })
      return
    }

    dispatch(loginStart())

    try {
      const result = await loginMutation.mutateAsync({ username, password })
      
      dispatch(loginSuccess({
        user: result.user,
        token: result.token
      }))

      toast({
        title: "Welcome back!",
        description: `Logged in as ${result.user.name}`,
      })

      // Correct logic: Navigate based on the user's role
      if (result.user.role === 'admin') {
        const from = location.state?.from?.pathname || '/admin'
        navigate(from, { replace: true })
      } else if (result.user.role === 'employee') {
        const from = location.state?.from?.pathname || '/gates'
        navigate(from, { replace: true })
      } else {
        // Handle unexpected roles
        dispatch(loginFailure())
        toast({
          title: "Login failed",
          description: "User role is not recognized.",
          variant: "destructive",
        })
      }

    } catch (error) {
      dispatch(loginFailure())
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <MdLocalParking className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Parking System</CardTitle>
          <CardDescription>
            Sign in to access the parking management system
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-sm text-muted-foreground">
            <p className="font-medium mb-1">Demo Credentials:</p>
            <p>Admin: admin / adminpass</p>
            <p>Employee: emp1 / pass1</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
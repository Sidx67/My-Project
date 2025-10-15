import { Component, inject } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgIf, NgForOf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HttpClientModule, FormsModule, NgIf, NgForOf, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'Simple Product App';

  username = '';
  password = '';
  loggedIn = false;
  error = '';
  products: any[] = [];

  newName = '';
  newPrice = '';
  selectedFile: File | null = null;

  editingId: number | null = null;
  editName = '';
  editPrice = 0;
  editFile: File | null = null;

  http = inject(HttpClient);

  // Login
  login() {
    this.http.post('http://localhost:8080/login', { username: this.username, password: this.password })
      .subscribe((res: any) => {
        if (res) {
          this.loggedIn = true;
          this.loadProducts();
        } else {
          this.error = 'Invalid login';
        }
      });
  }

  // Forgot password demo
  forgotPassword() {
    const email = prompt('Enter your email to reset password:');
    if (email) {
      alert(`Password reset link sent to ${email}. (Demo only)`);
    }
  }

  // Load products
  loadProducts() {
    this.http.get<any[]>('http://localhost:8080/products')
      .subscribe(data => this.products = data);
  }

  // File selected for new product
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;
  }

  // File selected for editing
  onEditFileSelected(event: any) {
    this.editFile = event.target.files[0] ?? null;
  }

  // Add product with image
  addProduct() {
    const formData = new FormData();
    formData.append('name', this.newName);
    formData.append('price', this.newPrice.toString());
    if (this.selectedFile) formData.append('image', this.selectedFile);

    this.http.post('http://localhost:8080/products', formData)
      .subscribe(() => {
        this.loadProducts();
        this.newName = '';
        this.newPrice = '';
        this.selectedFile = null;
      });
  }

  // Delete product
  deleteProduct(id: number) {
    this.http.delete(`http://localhost:8080/products/${id}`)
      .subscribe(() => this.loadProducts());
  }

  // Start editing
  startEdit(p: any) {
    this.editingId = p.id;
    this.editName = p.name;
    this.editPrice = Number(p.price);
    this.editFile = null;
  }

  // Cancel edit
  cancelEdit() {
    this.editingId = null;
    this.editName = '';
    this.editPrice = 0;
    this.editFile = null;
  }

  // Update product with optional new image
  updateProduct() {
    if (this.editingId === null) return;

    const formData = new FormData();
    formData.append('name', this.editName);
    formData.append('price', this.editPrice.toString());
    if (this.editFile) formData.append('image', this.editFile);

    this.http.put(`http://localhost:8080/products/${this.editingId}`, formData)
      .subscribe(() => {
        this.loadProducts();
        this.cancelEdit();
      });
  }

  // Logout
  logout() {
    this.loggedIn = false;
    this.username = '';
    this.password = '';
    this.products = [];
  }
}

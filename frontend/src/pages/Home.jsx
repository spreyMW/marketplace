import { Link } from 'react-router-dom';
import { ShoppingCart, Leaf, TrendingUp, Zap, Star, Users, ArrowRight, CheckCircle, Truck, Clock, Award, Droplet, Wrench, Cog, Hammer } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  async function fetchFeaturedProducts() {
    try {
      setLoading(true);
      const data = await apiClient.get('/products?limit=6');
      const productsArray = Array.isArray(data) ? data : (data?.data || data?.products || []);
      setProducts(productsArray.slice(0, 6));
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white">
      {/* Enhanced Hero Section */}
      <section className="relative px-4 py-32 sm:px-6 lg:px-8 bg-gradient-to-br from-green-700 via-green-800 to-amber-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-green-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-700 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
                Premium Agricultural<br/>
                <span className="text-amber-300">Equipment & Supplies</span>
              </h1>
              <p className="text-xl text-green-100 mb-8 max-w-xl">
                Your trusted source for high-quality irrigation systems, machinery, pipes, and all the equipment you need to optimize your farm operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-lg transition transform hover:scale-105 gap-2"
                >
                  <ShoppingCart size={22} />
                  Shop Now
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center border-2 border-white text-white font-bold py-4 px-8 rounded-lg hover:bg-white hover:text-green-700 transition"
                >
                  Browse Categories
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-amber-600 rounded-3xl blur-2xl opacity-40"></div>
                <div className="relative bg-gradient-to-br from-green-100 to-amber-50 rounded-3xl p-8 border-2 border-green-300">
                  <Leaf className="text-green-700 w-full h-64" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="bg-gradient-to-r from-green-50 to-amber-50 px-4 py-8 sm:px-6 lg:px-8 border-b-2 border-green-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="bg-green-700 rounded-full p-3">
                <Award className="text-white" size={28} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">20+</p>
                <p className="text-slate-600 text-sm">Years Experience</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-green-700 rounded-full p-3">
                <Users className="text-white" size={28} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">50K+</p>
                <p className="text-slate-600 text-sm">Happy Customers</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-green-700 rounded-full p-3">
                <ShoppingCart className="text-white" size={28} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">1000+</p>
                <p className="text-slate-600 text-sm">Products</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-green-700 rounded-full p-3">
                <Truck className="text-white" size={28} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">24/7</p>
                <p className="text-slate-600 text-sm">Fast Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Enhanced */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Agriculture Hub?</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">We provide premium agricultural equipment built to last and backed by expert support</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 border-2 border-green-200 hover:shadow-xl transition">
            <div className="bg-green-700 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <Award className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Premium Quality</h3>
            <p className="text-slate-600 leading-relaxed">Only certified, durable equipment from trusted manufacturers. Built to withstand demanding farm conditions.</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 border-2 border-green-200 hover:shadow-xl transition">
            <div className="bg-green-700 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <TrendingUp className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Competitive Pricing</h3>
            <p className="text-slate-600 leading-relaxed">Best prices on irrigation systems, pipes, machinery, and all agricultural equipment you need.</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 border-2 border-green-200 hover:shadow-xl transition">
            <div className="bg-green-700 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <Truck className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Expert Support</h3>
            <p className="text-slate-600 leading-relaxed">Technical support and installation guidance available. We're here to help you succeed.</p>
          </div>
        </div>
      </section>

      {/* Featured Products - Enhanced */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-2">Featured Products</h2>
              <p className="text-slate-600">Handpicked equipment selections just for you</p>
            </div>
            <Link to="/products" className="hidden sm:inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold">
              View All <ArrowRight size={20} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
              </div>
              <p className="text-slate-600 mt-4">Loading equipment...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {products.map(product => (
                  <Link key={product.id} to={`/products/${product.id}`}>
                    <div className="bg-white rounded-2xl overflow-hidden border-2 border-slate-100 hover:border-green-400 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
                      {/* Product Image Container */}
                      <div className="relative h-56 bg-gradient-to-br from-green-100 to-amber-50 overflow-hidden">
                        {product.featured_image ? (
                          <img
                            src={product.featured_image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Leaf className="text-green-400 opacity-40" size={80} />
                          </div>
                        )}
                        
                        {product.stock > 0 && (
                          <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                            In Stock
                          </div>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                            Out of Stock
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-green-700 transition">{product.name}</h3>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2 h-10">{product.description}</p>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-sm text-slate-500">(48 reviews)</span>
                        </div>

                        {/* Price and Action */}
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-bold text-green-700">${product.price}</span>
                          <button className="bg-green-700 hover:bg-green-800 text-white p-3 rounded-full transition transform hover:scale-110">
                            <ShoppingCart size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center sm:hidden">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-lg transition w-full"
                >
                  View All Products <ArrowRight size={20} />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Leaf className="mx-auto text-green-300 mb-4" size={64} />
              <p className="text-slate-600 mb-4 text-lg">No products available at the moment</p>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-lg transition"
              >
                Browse All Products <ArrowRight size={20} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Product Categories */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-2">Shop by Category</h2>
          <p className="text-slate-600">Find exactly what you're looking for</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Irrigation Systems', color: 'from-blue-500 to-green-600', Icon: Droplet },
            { name: 'Pipes & Fittings', color: 'from-gray-600 to-gray-800', Icon: Wrench },
            { name: 'Machinery', color: 'from-orange-500 to-red-600', Icon: Cog },
            { name: 'Tools & Supplies', color: 'from-green-600 to-green-700', Icon: Hammer }
          ].map((category, index) => (
            <Link key={index} to="/products">
              <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-8 text-white text-center hover:shadow-xl transition transform hover:scale-105 cursor-pointer group`}>
                <category.Icon className="w-12 h-12 mx-auto mb-3" />
                <h3 className="text-2xl font-bold">{category.name}</h3>
                <p className="text-sm opacity-90 mt-2 group-hover:opacity-100">Explore now</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-2">What Our Customers Say</h2>
            <p className="text-slate-600">Join thousands of satisfied customers</p>
          </div>

        <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Rajesh Kumar',
                role: 'Farm Owner - Madhya Pradesh',
                text: 'Excellent quality irrigation systems and affordable prices. The equipment has significantly improved my crop yield!',
                rating: 5
              },
              {
                name: 'Priya Sharma',
                role: 'Agricultural Supplier',
                text: 'Reliable supplier with consistent quality and fast delivery. My customers are very satisfied with the equipment quality.',
                rating: 5
              },
              {
                name: 'Vikram Singh',
                role: 'Farm Manager - Punjab',
                text: 'Best prices on machinery and pipes. The technical support team is very helpful. Highly recommend to all farmers!',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border-2 border-slate-100 shadow-md hover:shadow-xl transition hover:border-green-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">About Agriculture Hub</h2>
            <p className="text-lg text-slate-600 mb-4 leading-relaxed">
              We're the leading marketplace for premium agricultural equipment and supplies. With over 20 years of experience, we connect farmers and agricultural businesses with high-quality irrigation systems, machinery, pipes, and essential farm equipment.
            </p>
            <div className="space-y-4">
              {[
                'Wide range of irrigation & water management systems',
                'Industrial-grade pipes and fittings',
                'Farm machinery and equipment',
                'Technical support and installation guidance'
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl blur-2xl opacity-30"></div>
              <div className="relative bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl p-12 border-2 border-blue-200 flex items-center justify-center">
                <Leaf className="text-blue-600 w-full h-80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-r from-green-700 to-amber-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Grow Your Farm with Quality Equipment</h2>
          <p className="text-xl text-green-100 mb-8">Discover our complete range of agricultural equipment, irrigation systems, and farm supplies</p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-lg transition transform hover:scale-105 text-lg"
          >
            Browse Equipment <ArrowRight size={24} />
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Get in Touch</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-green-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <p className="text-green-100">info@agriculturehub.com</p>
            </div>
            <div className="text-center">
              <div className="bg-green-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Truck className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Phone</h3>
              <p className="text-green-100">+1 (555) 123-4567</p>
            </div>
            <div className="text-center">
              <div className="bg-green-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Leaf className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Address</h3>
              <p className="text-green-100">123 Farm Road, Agriculture City</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
